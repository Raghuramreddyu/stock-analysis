import re


def clean_line(line):
    """
    Clean OCR line while preserving useful decimal/percentage characters.
    """
    line = line.strip()

    line = line.replace("$", "")
    line = line.replace(",", "")

    return line


def parse_number(value):
    """
    Convert OCR text into a float.
    """
    value = clean_line(value)

    match = re.search(r"-?\d+(?:\.\d+)?", value)

    if not match:
        return None

    try:
        return float(match.group())
    except ValueError:
        return None


def parse_percentage(value):
    """
    Parse percentage values.

    Handles OCR errors such as:
        4.38%  -> 4.38
        438%   -> 4.38

    The second case can happen when OCR loses the decimal point.
    """
    value = clean_line(value)

    number = parse_number(value)

    if number is None:
        return None

    # OCR sometimes removes the decimal point.
    # Example:
    # 4.38% -> 438%
    #
    # Since stock daily percentage changes above 100% are highly
    # suspicious for this type of market-mover data, repair them.
    if number > 100:
        number = number / 100

    return number


def normalize_ticker(ticker):
    """
    Normalize ticker text and fix common OCR mistakes.
    """
    ticker = ticker.strip().upper()

    ticker = re.sub(
        r"[^A-Z0-9]",
        "",
        ticker
    )

    # Common OCR correction.
    #
    # AJG is sometimes recognized as AUG because
    # OCR confuses J and U.
    ocr_corrections = {
        "AUG": "AJG",
    }

    return ocr_corrections.get(
        ticker,
        ticker
    )


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


def parse_row_based(lines):
    """
    Parse traditional row-based OCR:

    Ticker Price Chg %Chg Vol%Chg

    Example:
    ASND 270.21 2.90 1.08% 85%

    If OCR corrupts the Change value but Price and
    Change % are available, estimate the Change value
    from those two values.
    """

    stocks = []

    for line in lines:

        parts = line.split()

        if len(parts) < 5:
            continue

        ticker = normalize_ticker(parts[0])

        if not is_ticker(ticker):
            continue

        price = parse_number(parts[1])
        change = parse_number(parts[2])
        change_percent = parse_percentage(parts[3])
        volume_change_percent = parse_percentage(parts[4])

        if price is None:
            continue

        if change_percent is None:
            continue

        if volume_change_percent is None:
            continue

        # --------------------------------------------------
        # Recover corrupted OCR change value
        # --------------------------------------------------
        #
        # Example:
        #
        # Current Price = 63.86
        # Change %      = 1.87%
        #
        # Previous Price ≈ 63.86 / 1.0187
        #
        # Change ≈ 63.86 - Previous Price
        #
        # ≈ 1.17
        #
        # This allows us to recover rows where OCR reads
        # something like "te" instead of "1.17".
        # --------------------------------------------------

        if change is None:

            change = (
                price
                * change_percent
                / (100 + change_percent)
            )

            change = round(
                change,
                2
            )

        stocks.append({
            "ticker": ticker,
            "price": price,
            "change": change,
            "change_percent": change_percent,
            "volume_change_percent": volume_change_percent
        })

    return stocks


def get_section(lines, start_index, end_headers):
    """
    Return lines belonging to a column section.
    """

    section = []

    for index in range(
        start_index + 1,
        len(lines)
    ):
        line = lines[index].strip()

        if line in end_headers:
            break

        if line:
            section.append(line)

    return section


def find_header_index(lines, header):
    """
    Find a header in OCR lines.
    """

    header = header.upper()

    for index, line in enumerate(lines):

        normalized = line.strip().upper()

        if normalized == header:
            return index

    return -1


def parse_column_based(lines):
    """
    Parse column-oriented screenshots.

    Example OCR structure:

    Ticker
    ASND
    AMG
    VIRT

    Price
    270.21
    361.30
    63.86

    Chg
    2.90
    4.83
    1.17

    % Chg
    1.08%
    1.35%
    1.87%

    Vol % Chg
    85%
    65%
    56%
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

    # Keep only valid ticker-looking values.
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
        parse_percentage(value)
        for value in percentages
    ]

    volumes = [
        parse_percentage(value)
        for value in volumes
    ]

    count = min(
        len(tickers),
        len(prices),
        len(changes),
        len(percentages),
        len(volumes)
    )

    stocks = []

    for index in range(count):

        if prices[index] is None:
            continue

        if changes[index] is None:
            continue

        if percentages[index] is None:
            continue

        if volumes[index] is None:
            continue

        stocks.append({
            "ticker": tickers[index],
            "price": prices[index],
            "change": changes[index],
            "change_percent": percentages[index],
            "volume_change_percent": volumes[index]
        })

    return stocks


def parse_stock_data(text):
    """
    Main stock parser.

    Supports both:

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

    # --------------------------------------------------
    # Try row-based format first
    # --------------------------------------------------

    row_stocks = parse_row_based(lines)

    if row_stocks:
        return row_stocks

    # --------------------------------------------------
    # Try column-based format
    # --------------------------------------------------

    column_stocks = parse_column_based(lines)

    if column_stocks:
        return column_stocks

    return []