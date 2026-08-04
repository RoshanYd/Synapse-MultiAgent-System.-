"""
Synapse Analytics Engine — Core Analytics Module
Deterministic NLP sentiment + ML price prediction (zero LLM dependency).
"""

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# ---------------------------------------------------------------------------
# NLTK VADER bootstrap — downloads lexicon data on first run
# ---------------------------------------------------------------------------
nltk.download("vader_lexicon", quiet=True)

_sia = SentimentIntensityAnalyzer()


def analyze_sentiment(reviews: list[str]) -> float:
    """
    Compute the mean VADER compound sentiment score across a list of reviews.

    Args:
        reviews: List of review/feedback text strings.

    Returns:
        A float in the range [-1.0, 1.0] where:
          -1.0 = most negative, 0.0 = neutral, 1.0 = most positive.
        Returns 0.0 if the review list is empty.
    """
    if not reviews:
        return 0.0

    compound_scores = [
        _sia.polarity_scores(review)["compound"] for review in reviews
    ]
    return round(sum(compound_scores) / len(compound_scores), 4)


def predict_next_price(historical_prices: list[float]) -> float:
    """
    Fit a simple LinearRegression on historical price data and predict the
    next time-step price using pure Python math (no scikit-learn dependency).

    The model treats the array index as the independent variable (time step)
    and the price as the dependent variable.

    Args:
        historical_prices: An ordered list of past price points (at least 2).

    Returns:
        The predicted price for the next time step, rounded to 2 decimals.

    Raises:
        ValueError: If fewer than 2 data points are provided.
    """
    n = len(historical_prices)
    if n < 2:
        raise ValueError("At least 2 historical price points are required.")

    x = list(range(n))
    y = historical_prices
    
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_xx = sum(xi * xi for xi in x)
    
    # Calculate slope (m) and intercept (c)
    m = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x ** 2)
    c = (sum_y - m * sum_x) / n
    
    predicted = m * n + c

    return round(float(predicted), 2)


import re
import asyncio
import httpx
from bs4 import BeautifulSoup
import logging

async def extract_pricing_tiers(url: str, default_price: float) -> tuple[float, float]:
    """
    Attempt to scrape a competitor's page to extract pricing tiers using Regex.
    Returns (min_price, max_price). If scraping fails or no prices found, returns (default_price, default_price).
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, follow_redirects=True)
            if resp.status_code != 200:
                return default_price, default_price
                
            soup = BeautifulSoup(resp.text, "html.parser")
            text = soup.get_text(separator=" ", strip=True)
            
            # Find numbers preceded by $ or ₹
            # Matches strings like ₹500, $ 10.99, ₹ 1,500
            pattern = r"[\$₹]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)"
            matches = re.findall(pattern, text)
            
            prices = []
            for match in matches:
                # Remove commas and convert to float
                clean_num = match.replace(',', '')
                try:
                    prices.append(float(clean_num))
                except ValueError:
                    pass
            
            if not prices:
                return default_price, default_price
                
            # Filter out extreme outliers (e.g., $1,000,000 which might be a marketing number, or 0)
            valid_prices = [p for p in prices if 0 < p < 100000]
            
            if not valid_prices:
                return default_price, default_price
                
            min_price = round(min(valid_prices), 2)
            max_price = round(max(valid_prices), 2)
            
            # If the site used $ and we want ₹ (assuming ~83 conversion)
            if "$" in text and "₹" not in text:
                min_price = round(min_price * 83, 2)
                max_price = round(max_price * 83, 2)
                
            return min_price, max_price
            
    except Exception as e:
        logging.warning(f"Failed to extract pricing from {url}: {e}")
        return default_price, default_price


def generate_swot(competitor_count: int, avg_price: float, avg_sentiment: float) -> dict:
    """
    Generate a deterministic SWOT analysis based on market metrics.
    """
    swot = {
        "strengths": [],
        "weaknesses": [],
        "opportunities": [],
        "threats": []
    }
    
    # Strengths (Market Validation)
    if competitor_count >= 5:
        swot["strengths"].append("Highly validated market with proven demand.")
    else:
        swot["strengths"].append("First-mover advantage in an unsaturated niche.")
        
    if avg_price > 2000:
        swot["strengths"].append("High-ticket potential allows for healthy margins.")
        
    # Weaknesses (Incumbent Strength)
    if avg_sentiment > 0.3:
        swot["weaknesses"].append("Incumbents have high customer satisfaction, making displacement harder.")
    elif competitor_count > 10:
        swot["weaknesses"].append("Extremely crowded space requiring significant marketing spend to stand out.")
    else:
        swot["weaknesses"].append("Lack of established market awareness requires educating the customer.")
        
    # Opportunities (Incumbent Weakness)
    if avg_sentiment < 0.1:
        swot["opportunities"].append("Market is frustrated with current solutions; opportunity for premium disruption.")
    
    if avg_price < 1000:
        swot["opportunities"].append("Opportunity to introduce a premium 'Enterprise' tier that incumbents lack.")
        
    if len(swot["opportunities"]) == 0:
        swot["opportunities"].append("Rapid iteration and modern UI/UX can steal market share from legacy players.")
        
    # Threats (Market Risks)
    if competitor_count > 8 and avg_price < 1500:
        swot["threats"].append("High risk of price wars due to many low-cost alternatives.")
    elif avg_sentiment > 0.5:
        swot["threats"].append("High barriers to entry due to intense brand loyalty for existing tools.")
    else:
        swot["threats"].append("Potential for larger tech companies to bundle this feature for free.")
        
    return swot
