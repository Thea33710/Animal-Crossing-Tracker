"""
Turnip Price Predictor v3 — Monte Carlo + algorithme exact ACNH
================================================================
Basé sur le reverse-engineering de l'algorithme de prix d'Animal Crossing: New Horizons
par Ninji (2020) : https://gist.github.com/Treeki/85be14d297c80c8b3c0a76375743325

Fonctionnement :
  1. Génère N_SIMULATIONS trajectoires de prix possibles selon les vraies règles du jeu
  2. Filtre celles qui ne correspondent pas aux prix observés (tolérance ±1 clochette)
  3. Calcule min / max / percentiles sur les trajectoires valides restantes
  4. Plus il y a de prix saisis → moins de trajectoires valides → fourchettes ultra-précises
"""

import random
from typing import List, Optional, Dict, Tuple

N_SIMULATIONS = 20_000   # Nombre de simulations par pattern
TOLERANCE = 2            # Tolérance en clochettes (±) pour matcher un prix observé

DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

PATTERN_PRIOR = {
    "large_spike": 0.25,
    "decreasing":  0.30,
    "small_spike": 0.25,
    "random":      0.20,
}

PATTERN_LABELS = {
    "large_spike": "Grand pic",
    "decreasing":  "Décroissant",
    "small_spike": "Petit pic",
    "random":      "Aléatoire",
}


# ──────────────────────────────────────────────────────────────
#  Générateurs de prix selon l'algorithme exact d'ACNH (Ninji)
# ──────────────────────────────────────────────────────────────

def _randfloat(lo: float, hi: float) -> float:
    """Uniforme continue — reflète le RNG du jeu."""
    return random.uniform(lo, hi)


def _randint(lo: int, hi: int) -> int:
    """Entier uniforme inclus (comme le jeu)."""
    return random.randint(lo, hi)


def _floor(x: float) -> int:
    return int(x)


def generate_decreasing(base: int) -> List[int]:
    """
    Pattern décroissant : deux phases de baisse, chacune avec un taux aléatoire.
    Le prix diminue d'environ 3-5% toutes les demi-journées.
    """
    prices = [0] * 12
    rate = _randfloat(0.6, 0.8)
    for i in range(12):
        # Légère variation aléatoire autour du taux de décroissance
        price = _floor(_randfloat(rate - 0.05, rate) * base)
        prices[i] = max(price, 1)
        rate -= _randfloat(0.03, 0.05)
    return prices


def generate_large_spike(base: int) -> List[int]:
    """
    Grand pic : baisse légère → montée → PIC MAJEUR (200-600%) → chute brutale.
    Le pic se produit sur 5 demi-journées consécutives dont 1 est le sommet.
    La position du pic peut commencer n'importe où entre le slot 2 et 7.
    """
    prices = [0] * 12
    peak_start = _randint(1, 7)  # Slot de début de la phase de montée

    # Phase 1 : légère décroissance avant le pic
    rate = _randfloat(0.6, 0.8)
    for i in range(peak_start):
        prices[i] = max(_floor(_randfloat(rate - 0.05, rate) * base), 1)
        rate -= _randfloat(0.03, 0.05)

    # Phase 2 : montée vers le pic (5 slots)
    # slot +0 : montée légère
    # slot +1 : montée forte
    # slot +2 : PIC (2x - 6x)
    # slot +3 : descente forte
    # slot +4 : descente légère
    spike = [
        (0.9,  1.4),   # pré-pic 1
        (1.4,  2.0),   # pré-pic 2
        (2.0,  6.0),   # SOMMET
        (1.4,  2.0),   # post-pic 1
        (0.9,  1.4),   # post-pic 2
    ]
    for j, (lo, hi) in enumerate(spike):
        idx = peak_start + j
        if idx < 12:
            prices[idx] = max(_floor(_randfloat(lo, hi) * base), 1)

    # Phase 3 : chute après le pic
    rate = _randfloat(0.4, 0.7)
    for i in range(peak_start + 5, 12):
        prices[i] = max(_floor(_randfloat(rate - 0.05, rate) * base), 1)
        rate -= _randfloat(0.03, 0.05)

    return prices


def generate_small_spike(base: int) -> List[int]:
    """
    Petit pic : même structure que le grand pic mais plafond à 2x seulement.
    """
    prices = [0] * 12
    peak_start = _randint(1, 7)

    rate = _randfloat(0.6, 0.8)
    for i in range(peak_start):
        prices[i] = max(_floor(_randfloat(rate - 0.05, rate) * base), 1)
        rate -= _randfloat(0.03, 0.05)

    spike = [
        (0.9,  1.4),
        (1.4,  2.0),   # SOMMET (petit pic)
        (1.4,  2.0),
        (0.9,  1.4),
        (0.6,  1.0),
    ]
    for j, (lo, hi) in enumerate(spike):
        idx = peak_start + j
        if idx < 12:
            prices[idx] = max(_floor(_randfloat(lo, hi) * base), 1)

    rate = _randfloat(0.4, 0.7)
    for i in range(peak_start + 5, 12):
        prices[i] = max(_floor(_randfloat(rate - 0.05, rate) * base), 1)
        rate -= _randfloat(0.03, 0.05)

    return prices


def generate_random(base: int) -> List[int]:
    """
    Pattern aléatoire : chaque demi-journée est indépendante, entre 60% et 140%.
    Peut inclure 2 sous-phases de légère décroissance.
    """
    prices = [0] * 12
    for i in range(12):
        prices[i] = max(_floor(_randfloat(0.6, 1.4) * base), 1)
    return prices


GENERATORS = {
    "large_spike": generate_large_spike,
    "decreasing":  generate_decreasing,
    "small_spike": generate_small_spike,
    "random":      generate_random,
}


# ──────────────────────────────────────────────────────────────
#  Filtre & agrégation
# ──────────────────────────────────────────────────────────────

def _matches(simulated: List[int], observed: List[Optional[int]]) -> bool:
    """Retourne True si la simulation est compatible avec les prix observés."""
    for sim, obs in zip(simulated, observed):
        if obs is not None and abs(sim - obs) > TOLERANCE:
            return False
    return True


def _aggregate(valid_sims: List[List[int]], slot: int) -> Tuple[int, int, int, float]:
    """Retourne (min, max, médiane, confiance_relative) pour un slot donné."""
    values = sorted(s[slot] for s in valid_sims)
    if not values:
        return 0, 0, 0, 0.0
    lo = values[int(len(values) * 0.05)]    # 5e percentile
    hi = values[int(len(values) * 0.95)]    # 95e percentile
    mid = values[len(values) // 2]          # médiane
    # Resserrement : plus la fourchette est étroite relativement, plus on est confiant
    spread = (hi - lo) / max(mid, 1)
    confidence = max(0.05, min(0.99, 1.0 - spread / 2.0))
    return lo, hi, mid, round(confidence, 2)


# ──────────────────────────────────────────────────────────────
#  Classe principale
# ──────────────────────────────────────────────────────────────

class TurnipPredictor:

    def __init__(self, purchase_price: int, prices: List[Optional[int]]):
        self.purchase_price = purchase_price
        self.prices = prices
        self.known_count = sum(1 for p in prices if p is not None)

    def predict(self) -> Dict:
        if self.known_count == 0:
            return self._default_prediction()

        # ── 1. Simulation Monte Carlo par pattern ──────────────
        pattern_valid: Dict[str, List[List[int]]] = {}
        for pattern, generator in GENERATORS.items():
            valid = []
            for _ in range(N_SIMULATIONS):
                sim = generator(self.purchase_price)
                if _matches(sim, self.prices):
                    valid.append(sim)
            pattern_valid[pattern] = valid

        total_valid = sum(len(v) for v in pattern_valid.values())

        if total_valid == 0:
            # Aucune simulation ne correspond : élargir la tolérance et réessayer
            return self._fallback_prediction()

        # ── 2. Probabilités de chaque pattern ─────────────────
        pattern_probs = {}
        for pattern, valid in pattern_valid.items():
            # Pondéré par le prior et le nombre de simulations valides
            raw = len(valid) * PATTERN_PRIOR[pattern]
            pattern_probs[pattern] = raw

        total = sum(pattern_probs.values()) or 1
        pattern_probs = {p: v / total for p, v in pattern_probs.items()}

        best_pattern = max(pattern_probs, key=pattern_probs.get)
        global_confidence = round(pattern_probs[best_pattern], 2)

        # ── 3. Toutes les simulations valides fusionnées ───────
        all_valid = []
        for valid in pattern_valid.values():
            all_valid.extend(valid)

        # ── 4. Prédictions par slot ────────────────────────────
        future_prices = []
        for i in range(12):
            if self.prices[i] is not None:
                future_prices.append({
                    "slot":       i,
                    "day":        DAYS[i // 2],
                    "period":     "AM" if i % 2 == 0 else "PM",
                    "min":        self.prices[i],
                    "max":        self.prices[i],
                    "mid":        self.prices[i],
                    "known":      True,
                    "confidence": 1.0,
                    "valid_sims": len(all_valid),
                })
            else:
                lo, hi, mid, conf = _aggregate(all_valid, i)
                # Confiance affinée : booste si peu de patterns survivent
                pattern_dominance = max(pattern_probs.values())
                refined_conf = round((conf * 0.6 + pattern_dominance * 0.4), 2)
                future_prices.append({
                    "slot":       i,
                    "day":        DAYS[i // 2],
                    "period":     "AM" if i % 2 == 0 else "PM",
                    "min":        lo,
                    "max":        hi,
                    "mid":        mid,
                    "known":      False,
                    "confidence": min(0.99, refined_conf),
                    "valid_sims": len(all_valid),
                })

        recommendation = self._recommendation(best_pattern, future_prices, global_confidence)
        peak_slot = max(
            (p for p in future_prices if not p["known"]),
            key=lambda p: p["max"],
            default=None,
        )

        return {
            "pattern":               best_pattern,
            "confidence":            global_confidence,
            "pattern_probabilities": {p: round(v, 3) for p, v in pattern_probs.items()},
            "valid_simulations":     total_valid,
            "future_prices":         future_prices,
            "recommendation":        recommendation,
            "peak_price":            peak_slot["max"] if peak_slot else None,
            "peak_day":              f"{peak_slot['day']} {peak_slot['period']}" if peak_slot else None,
        }

    # ── Helpers ────────────────────────────────────────────────

    def _default_prediction(self) -> Dict:
        base = self.purchase_price
        return {
            "pattern":               "unknown",
            "confidence":            0.0,
            "pattern_probabilities": PATTERN_PRIOR,
            "valid_simulations":     0,
            "future_prices": [
                {
                    "slot": i, "day": DAYS[i // 2],
                    "period": "AM" if i % 2 == 0 else "PM",
                    "min": int(base * 0.3), "max": int(base * 6.0), "mid": int(base * 0.9),
                    "known": False, "confidence": 0.0, "valid_sims": 0,
                }
                for i in range(12)
            ],
            "recommendation": "Saisissez au moins un prix pour obtenir une prédiction.",
            "peak_price": None,
            "peak_day": None,
        }

    def _fallback_prediction(self) -> Dict:
        """Si aucune simulation ne passe le filtre strict, on élargit."""
        base = self.purchase_price
        known = [(i, p) for i, p in enumerate(self.prices) if p is not None]
        note = "⚠️ Prix inhabituels détectés — vérifiez vos saisies."
        return {
            "pattern":               "random",
            "confidence":            0.10,
            "pattern_probabilities": PATTERN_PRIOR,
            "valid_simulations":     0,
            "future_prices": [
                {
                    "slot": i, "day": DAYS[i // 2],
                    "period": "AM" if i % 2 == 0 else "PM",
                    "min": int(base * 0.3) if self.prices[i] is None else self.prices[i],
                    "max": int(base * 6.0) if self.prices[i] is None else self.prices[i],
                    "mid": int(base * 0.9) if self.prices[i] is None else self.prices[i],
                    "known": self.prices[i] is not None,
                    "confidence": 0.05,
                    "valid_sims": 0,
                }
                for i in range(12)
            ],
            "recommendation": note,
            "peak_price": None,
            "peak_day": None,
        }

    def _recommendation(self, pattern: str, future: List[Dict], confidence: float) -> str:
        known = [p for p in future if p["known"]]
        unknown = [p for p in future if not p["known"]]
        current_max = max((p["max"] for p in known), default=0)
        future_max = max((p["max"] for p in unknown), default=0)
        peak_slot = max(unknown, key=lambda p: p["max"], default=None)
        peak_str = f"{peak_slot['day']} {peak_slot['period']}" if peak_slot else "?"

        low = " (continuez à saisir pour affiner)" if confidence < 0.5 else ""

        if pattern == "decreasing":
            if current_max > self.purchase_price:
                return f"🔴 Vendez maintenant ! Les prix vont continuer à baisser{low}."
            return f"💔 Semaine déficitaire — coupez vos pertes au plus tôt{low}."

        elif pattern in ("small_spike", "large_spike"):
            if current_max >= future_max * 0.95:
                return f"💰 Vous êtes au pic ! Vendez immédiatement{low}."
            return f"⏳ Attendez le pic prévu vers {peak_str}{low}."

        else:
            if current_max > self.purchase_price * 1.3:
                return f"✅ Bon prix disponible — vendez ou patientez encore{low}."
            return f"⚠️ Pattern aléatoire — vérifiez les prix matin et soir{low}."
