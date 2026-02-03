Create a new stock price chart component below the ticker section that displays end-of-day prices with interactive timeline options.

Requirements:

Location: Add the chart below the existing ticker section in the overview tab

Data Source: Use yfinance to fetch historical price data

Chart Type: Line chart showing closing prices

Default View: Last 7 days of price data

Timeline Options: Add buttons/controls for: Last 7 days (default) | Last 3 | Last 6 months | Last year

Chart Library: Use shadcn Charts for consistent styling

Styling: Follow existing Tailwind patterns and maintain design consistency

Technical Notes:

Chart config should use color: "var(--chart-1)" (not wrapped in hsl())

Line component should include dot={{ fill: "var(--color-price)" }} for visible data points

Use type: "natural" for smooth curve rendering