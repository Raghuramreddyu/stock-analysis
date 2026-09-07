import re


# ============================================================
# Basic Cleaning
# ============================================================

def clean_line(line):
    """
    Clean OCR text while preserving useful
    decimal and percentage characters.
    """

    line = line.strip()
    line = line.replace("$", "")
    line = line.replace(",", "")

    return line


# ============================================================
# Number Parsing
# ============================================================

def parse_number(value):
    """
    Convert OCR text into a float.
    """

    if value is None:
        return None

    value = clean_line(str(value))

    match = re.search(
        r"-?\d+(?:\.\d+)?",
        value
    )

    if not match:
        return None

    try:
        return float(match.group())
    except ValueError:
        return None


# ============================================================
# Percentage Parsing
# ============================================================

def parse_percentage(value):
    """
    Parse a percentage value.

    Examples:
        4.38% -> 4.38
        0.59% -> 0.59
        103%  -> 103

    IMPORTANT:
    Volume percentage can legitimately be greater than 100,
    so we do NOT automatically divide values above 100.
    """

    if value is None:
        return None

    value = clean_line(str(value))

    number = parse_number(value)

    if number is None:
        return None

    return number


# ============================================================
# Change Percentage Parsing
# ============================================================

def parse_change_percentage(value):
    """
    Parse daily stock price percentage change.

    If OCR loses a decimal point and produces something like:

        108% instead of 1.08%

    repair it to:

        1.08
    """

    number = parse_percentage(value)

    if number is None:
        return None

    # Daily price changes above 100% are extremely unusual.
    # This is therefore treated as a likely OCR decimal-loss error.
    if number > 100:
        number = number / 100

    return number


# ============================================================
# Ticker Normalization
# ============================================================

def normalize_ticker(ticker):
    """
    Normalize ticker text and repair common OCR duplication.

    Example OCR errors:

        BPBPOP -> BPOP
        SHSHIP -> SHIP
        DEDELL -> DELL
        ININSW -> INSW
        DHDHT  -> DHT
        FRFRO  -> FRO
        TITILE -> TILE
        BEBEN  -> BEN
        SBSBLK -> SBLK
        NVNVDA -> NVDA
        VLVLO  -> VLO
        STSTNG -> STNG
        PSPSX  -> PSX
    """

    if ticker is None:
        return ""

    ticker = str(ticker).strip().upper()

    ticker = re.sub(
        r"[^A-Z0-9]",
        "",
        ticker
    )

    # --------------------------------------------------------
    # OCR duplication repair
    # --------------------------------------------------------
    #
    # The OCR output from the supplied screenshot is producing
    # a two-character prefix before the actual ticker.
    #
    # Example:
    #
    # BP + BPOP = BPBPOP
    # SH + SHIP = SHSHIP
    # DE + DELL = DEDELL
    #
    # Remove the first two characters when the resulting
    # value is a valid ticker.
    # --------------------------------------------------------

    if len(ticker) >= 5:
        possible_ticker = ticker[2:]

        if re.fullmatch(
            r"[A-Z]{1,5}",
            possible_ticker
        ):
            ticker = possible_ticker

    # --------------------------------------------------------
    # Common OCR corrections
    # --------------------------------------------------------

    ocr_corrections = {
        "AUG": "AJG",
    }

    return ocr_corrections.get(
        ticker,
        ticker
    )


# ============================================================
# Ticker Validation
# ============================================================

def is_ticker(value):
    """
    Basic ticker validation.
    """

    value = normalize_ticker(value)

    return bool(
        re.fullmatch(
            r"[A-Z]{1,5}",
            value
        )
    )


# ============================================================
# Recover Change From Price + Percentage
# ============================================================

def calculate_expected_change(
    price,
    change_percent
):
    """
    Calculate the expected price change from:

        Current Price
        Daily % Change

    Formula:

        Change =
        Price * Percentage / (100 + Percentage)

    Example:

        Price = 172.34
        Change % = 0.59

        Change ≈ 1.01
    """

    if price is None:
        return None

    if change_percent is None:
        return None

    denominator = 100 + change_percent

    if denominator == 0:
        return None

    change = (
        price
        * change_percent
        / denominator
    )

    return round(
        change,
        2
    )


# ============================================================
# Validate Change
# ============================================================

def validate_change(
    price,
    change,
    change_percent
):
    """
    Validate OCR-extracted change.

    If OCR has lost the decimal point:

        1.01 -> 101
        1.97 -> 197

    the value will be inconsistent with the price and
    percentage change.

    In that situation, calculate the correct value.
    """

    expected_change = calculate_expected_change(
        price,
        change_percent
    )

    if expected_change is None:
        return change

    if change is None:
        return expected_change

    # --------------------------------------------------------
    # Compare OCR value against mathematically expected value.
    # --------------------------------------------------------

    difference = abs(
        change - expected_change
    )

    # Normal OCR rounding difference.
    if difference <= 0.05:
        return round(
            change,
            2
        )

    # --------------------------------------------------------
    # OCR value is clearly corrupted.
    # Use the calculated value.
    # --------------------------------------------------------

    return expected_change


# ============================================================
# Row-Based Parser
# ============================================================

def parse_row_based(lines):
    """
    Parse traditional row-based OCR:

        Ticker Price Chg %Chg Vol%Chg

    Example:

        BPOP 172.34 1.01 0.59% 103%
    """

    stocks = []

    for line in lines:

        parts = line.split()

        if len(parts) < 5:
            continue

        # ----------------------------------------------------
        # Ticker
        # ----------------------------------------------------

        ticker = normalize_ticker(
            parts[0]
        )

        if not is_ticker(ticker):
            continue

        # ----------------------------------------------------
        # Price
        # ----------------------------------------------------

        price = parse_number(
            parts[1]
        )

        if price is None:
            continue

        # ----------------------------------------------------
        # Change
        # ----------------------------------------------------

        change = parse_number(
            parts[2]
        )

        # ----------------------------------------------------
        # Daily Change %
        # ----------------------------------------------------

        change_percent = parse_change_percentage(
            parts[3]
        )

        if change_percent is None:
            continue

        # ----------------------------------------------------
        # Volume Change %
        # ----------------------------------------------------

        volume_change_percent = parse_percentage(
            parts[4]
        )

        if volume_change_percent is None:
            continue

        # ----------------------------------------------------
        # Validate / repair Change
        # ----------------------------------------------------

        change = validate_change(
            price=price,
            change=change,
            change_percent=change_percent
        )

        if change is None:
            continue

        # ----------------------------------------------------
        # Store stock
        # ----------------------------------------------------

        stocks.append({
            "ticker": ticker,
            "price": price,
            "change": change,
            "change_percent": change_percent,
            "volume_change_percent": volume_change_percent
        })

    return stocks


# ============================================================
# Column Section
# ============================================================

def get_section(
    lines,
    start_index,
    end_headers
):
    """
    Return lines belonging to a column section.
    """

    section = []

    for index in range(
        start_index + 1,
        len(lines)
    ):

        line = lines[index].strip()

        if line.upper() in {
            header.upper()
            for header in end_headers
        }:
            break

        if line:
            section.append(line)

    return section


# ============================================================
# Header Detection
# ============================================================

def find_header_index(
    lines,
    header
):
    """
    Find a header in OCR lines.
    """

    header = header.upper()

    for index, line in enumerate(lines):

        normalized = line.strip().upper()

        if normalized == header:
            return index

    return -1


# ============================================================
# Column-Based Parser
# ============================================================

def parse_column_based(lines):
    """
    Parse column-oriented screenshots.

    Example:

        Ticker
        BPOP
        SHIP
        DELL

        Price
        172.34
        19.03
        526.25

        Chg
        1.01
        0.50
        9.86

        % Chg
        0.59%
        2.70%
        1.91%

        Vol % Chg
        103%
        89%
        73%
    """

    ticker_index = find_header_index(
        lines,
        "Ticker"
    )

    price_index = find_header_index(
        lines,
        "Price"
    )

    change_index = find_header_index(
        lines,
        "Chg"
    )

    percent_index = find_header_index(
        lines,
        "% Chg"
    )

    volume_index = find_header_index(
        lines,
        "Vol % Chg"
    )

    if (
        ticker_index == -1
        or price_index == -1
        or change_index == -1
        or percent_index == -1
        or volume_index == -1
    ):
        return []

    headers = {
        "Ticker",
        "Price",
        "Chg",
        "% Chg",
        "Vol % Chg",
        "Market"
    }

    # --------------------------------------------------------
    # Extract sections
    # --------------------------------------------------------

    tickers = get_section(
        lines,
        ticker_index,
        headers
    )

    prices = get_section(
        lines,
        price_index,
        headers
    )

    changes = get_section(
        lines,
        change_index,
        headers
    )

    percentages = get_section(
        lines,
        percent_index,
        headers
    )

    volumes = get_section(
        lines,
        volume_index,
        headers
    )

    # --------------------------------------------------------
    # Convert values
    # --------------------------------------------------------

    tickers = [
        normalize_ticker(value)
        for value in tickers
        if is_ticker(value)
    ]

    prices = [
        parse_number(value)
        for value in prices
    ]

    changes = [
        parse_number(value)
        for value in changes
    ]

    percentages = [
        parse_change_percentage(value)
        for value in percentages
    ]

    volumes = [
        parse_percentage(value)
        for value in volumes
    ]

    # --------------------------------------------------------
    # Match rows
    # --------------------------------------------------------

    count = min(
        len(tickers),
        len(prices),
        len(changes),
        len(percentages),
        len(volumes)
    )

    stocks = []

    for index in range(count):

        price = prices[index]

        change = changes[index]

        change_percent = percentages[index]

        volume_change_percent = volumes[index]

        if price is None:
            continue

        if change_percent is None:
            continue

        if volume_change_percent is None:
            continue

        # ----------------------------------------------------
        # Repair corrupted change value
        # ----------------------------------------------------

        change = validate_change(
            price=price,
            change=change,
            change_percent=change_percent
        )

        if change is None:
            continue

        stocks.append({
            "ticker": tickers[index],
            "price": price,
            "change": change,
            "change_percent": change_percent,
            "volume_change_percent": volume_change_percent
        })

    return stocks


# ============================================================
# Main Parser
# ============================================================

def parse_stock_data(text):
    """
    Main stock parser.

    Supports:

    1. Row-based OCR
    2. Column-based OCR
    """

    raw_lines = text.splitlines()

    lines = []

    for line in raw_lines:

        line = line.strip()

        if not line:
            continue

        lines.append(line)

    # --------------------------------------------------------
    # Try row-based format first
    # --------------------------------------------------------

    row_stocks = parse_row_based(
        lines
    )

    if row_stocks:
        return row_stocks

    # --------------------------------------------------------
    # Try column-based format
    # --------------------------------------------------------

    column_stocks = parse_column_based(
        lines
    )

    if column_stocks:
        return column_stocks

    return []