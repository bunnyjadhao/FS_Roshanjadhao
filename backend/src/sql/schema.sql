-- enable extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- routes (commutes)
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  start_geom geometry(Point,4326),
  end_geom geometry(Point,4326),
  route_geom geometry(LineString,4326),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  seats_available INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- chats and matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_a UUID REFERENCES routes(id),
  route_b UUID REFERENCES routes(id),
  initiator_user UUID,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id),
  sender_user UUID,
  content TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routes_route_geom ON routes USING GIST (route_geom);
