-- Fumble Machine Database Schema
-- Run this in your Supabase SQL Editor

-- Create prices table for caching
CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    historical_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    source VARCHAR(20) DEFAULT 'yahoo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, date)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_prices_lookup ON prices(symbol, date);
CREATE INDEX IF NOT EXISTS idx_prices_symbol ON prices(symbol);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (backend)
CREATE POLICY "Service role can do all" ON prices
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Create a function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prices_updated_at
    BEFORE UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users (for RLS)
GRANT ALL ON prices TO authenticated;
GRANT ALL ON prices TO service_role;
GRANT USAGE, SELECT ON SEQUENCE prices_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE prices_id_seq TO service_role;
