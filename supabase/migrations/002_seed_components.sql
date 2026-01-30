-- Seed Real PC Components

-- ============================================================================
-- CPUs
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
-- Intel 14th Gen
('cpu', 'Intel Core i9-14900K', 'Intel', 'i9-14900K', 549.99, '{
  "socket": "LGA1700",
  "cores": 24,
  "threads": 32,
  "base_clock": 3.2,
  "boost_clock": 6.0,
  "tdp": 125,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
('cpu', 'Intel Core i7-14700K', 'Intel', 'i7-14700K', 409.99, '{
  "socket": "LGA1700",
  "cores": 20,
  "threads": 28,
  "base_clock": 3.4,
  "boost_clock": 5.6,
  "tdp": 125,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
('cpu', 'Intel Core i5-14600K', 'Intel', 'i5-14600K', 319.99, '{
  "socket": "LGA1700",
  "cores": 14,
  "threads": 20,
  "base_clock": 3.5,
  "boost_clock": 5.3,
  "tdp": 125,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
('cpu', 'Intel Core i5-13400F', 'Intel', 'i5-13400F', 189.99, '{
  "socket": "LGA1700",
  "cores": 10,
  "threads": 16,
  "base_clock": 2.5,
  "boost_clock": 4.6,
  "tdp": 65,
  "ram_type": "DDR5",
  "integrated_graphics": false
}'::jsonb),
-- AMD Ryzen 7000
('cpu', 'AMD Ryzen 9 7950X', 'AMD', 'Ryzen 9 7950X', 549.99, '{
  "socket": "AM5",
  "cores": 16,
  "threads": 32,
  "base_clock": 4.5,
  "boost_clock": 5.7,
  "tdp": 170,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
('cpu', 'AMD Ryzen 9 7900X', 'AMD', 'Ryzen 9 7900X', 399.99, '{
  "socket": "AM5",
  "cores": 12,
  "threads": 24,
  "base_clock": 4.7,
  "boost_clock": 5.6,
  "tdp": 170,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
('cpu', 'AMD Ryzen 7 7800X3D', 'AMD', 'Ryzen 7 7800X3D', 449.99, '{
  "socket": "AM5",
  "cores": 8,
  "threads": 16,
  "base_clock": 4.2,
  "boost_clock": 5.0,
  "tdp": 120,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
('cpu', 'AMD Ryzen 5 7600X', 'AMD', 'Ryzen 5 7600X', 229.99, '{
  "socket": "AM5",
  "cores": 6,
  "threads": 12,
  "base_clock": 4.7,
  "boost_clock": 5.3,
  "tdp": 105,
  "ram_type": "DDR5",
  "integrated_graphics": true
}'::jsonb),
-- AMD Ryzen 5000 (AM4)
('cpu', 'AMD Ryzen 7 5800X3D', 'AMD', 'Ryzen 7 5800X3D', 299.99, '{
  "socket": "AM4",
  "cores": 8,
  "threads": 16,
  "base_clock": 3.4,
  "boost_clock": 4.5,
  "tdp": 105,
  "ram_type": "DDR4",
  "integrated_graphics": false
}'::jsonb),
('cpu', 'AMD Ryzen 5 5600X', 'AMD', 'Ryzen 5 5600X', 149.99, '{
  "socket": "AM4",
  "cores": 6,
  "threads": 12,
  "base_clock": 3.7,
  "boost_clock": 4.6,
  "tdp": 65,
  "ram_type": "DDR4",
  "integrated_graphics": false
}'::jsonb);

-- ============================================================================
-- GPUs
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
-- NVIDIA RTX 40 Series
('gpu', 'NVIDIA GeForce RTX 4090', 'NVIDIA', 'RTX 4090', 1599.99, '{
  "vram": 24,
  "vram_type": "GDDR6X",
  "tdp": 450,
  "length_mm": 336,
  "slot_width": 3,
  "power_connectors": "1x 16-pin"
}'::jsonb),
('gpu', 'NVIDIA GeForce RTX 4080 Super', 'NVIDIA', 'RTX 4080 Super', 999.99, '{
  "vram": 16,
  "vram_type": "GDDR6X",
  "tdp": 320,
  "length_mm": 304,
  "slot_width": 2.5,
  "power_connectors": "1x 16-pin"
}'::jsonb),
('gpu', 'NVIDIA GeForce RTX 4070 Ti Super', 'NVIDIA', 'RTX 4070 Ti Super', 799.99, '{
  "vram": 16,
  "vram_type": "GDDR6X",
  "tdp": 285,
  "length_mm": 285,
  "slot_width": 2.5,
  "power_connectors": "1x 16-pin"
}'::jsonb),
('gpu', 'NVIDIA GeForce RTX 4070 Super', 'NVIDIA', 'RTX 4070 Super', 599.99, '{
  "vram": 12,
  "vram_type": "GDDR6X",
  "tdp": 220,
  "length_mm": 267,
  "slot_width": 2,
  "power_connectors": "1x 16-pin"
}'::jsonb),
('gpu', 'NVIDIA GeForce RTX 4060 Ti', 'NVIDIA', 'RTX 4060 Ti', 399.99, '{
  "vram": 8,
  "vram_type": "GDDR6",
  "tdp": 160,
  "length_mm": 240,
  "slot_width": 2,
  "power_connectors": "1x 8-pin"
}'::jsonb),
('gpu', 'NVIDIA GeForce RTX 4060', 'NVIDIA', 'RTX 4060', 299.99, '{
  "vram": 8,
  "vram_type": "GDDR6",
  "tdp": 115,
  "length_mm": 240,
  "slot_width": 2,
  "power_connectors": "1x 8-pin"
}'::jsonb),
-- AMD RX 7000 Series
('gpu', 'AMD Radeon RX 7900 XTX', 'AMD', 'RX 7900 XTX', 949.99, '{
  "vram": 24,
  "vram_type": "GDDR6",
  "tdp": 355,
  "length_mm": 287,
  "slot_width": 2.5,
  "power_connectors": "2x 8-pin"
}'::jsonb),
('gpu', 'AMD Radeon RX 7900 XT', 'AMD', 'RX 7900 XT', 749.99, '{
  "vram": 20,
  "vram_type": "GDDR6",
  "tdp": 315,
  "length_mm": 276,
  "slot_width": 2.5,
  "power_connectors": "2x 8-pin"
}'::jsonb),
('gpu', 'AMD Radeon RX 7800 XT', 'AMD', 'RX 7800 XT', 499.99, '{
  "vram": 16,
  "vram_type": "GDDR6",
  "tdp": 263,
  "length_mm": 267,
  "slot_width": 2.5,
  "power_connectors": "2x 8-pin"
}'::jsonb),
('gpu', 'AMD Radeon RX 7600', 'AMD', 'RX 7600', 269.99, '{
  "vram": 8,
  "vram_type": "GDDR6",
  "tdp": 165,
  "length_mm": 204,
  "slot_width": 2,
  "power_connectors": "1x 8-pin"
}'::jsonb);

-- ============================================================================
-- Motherboards
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
-- Intel Z790 (LGA1700)
('motherboard', 'ASUS ROG Maximus Z790 Hero', 'ASUS', 'ROG Maximus Z790 Hero', 629.99, '{
  "socket": "LGA1700",
  "chipset": "Z790",
  "form_factor": "ATX",
  "ram_type": "DDR5",
  "ram_slots": 4,
  "max_ram_gb": 192,
  "m2_slots": 5
}'::jsonb),
('motherboard', 'MSI MAG Z790 Tomahawk WiFi', 'MSI', 'MAG Z790 Tomahawk WiFi', 289.99, '{
  "socket": "LGA1700",
  "chipset": "Z790",
  "form_factor": "ATX",
  "ram_type": "DDR5",
  "ram_slots": 4,
  "max_ram_gb": 128,
  "m2_slots": 4
}'::jsonb),
('motherboard', 'Gigabyte B760M DS3H', 'Gigabyte', 'B760M DS3H', 109.99, '{
  "socket": "LGA1700",
  "chipset": "B760",
  "form_factor": "Micro-ATX",
  "ram_type": "DDR5",
  "ram_slots": 2,
  "max_ram_gb": 64,
  "m2_slots": 2
}'::jsonb),
-- AMD X670/B650 (AM5)
('motherboard', 'ASUS ROG Crosshair X670E Hero', 'ASUS', 'ROG Crosshair X670E Hero', 699.99, '{
  "socket": "AM5",
  "chipset": "X670E",
  "form_factor": "ATX",
  "ram_type": "DDR5",
  "ram_slots": 4,
  "max_ram_gb": 128,
  "m2_slots": 5
}'::jsonb),
('motherboard', 'MSI MAG B650 Tomahawk WiFi', 'MSI', 'MAG B650 Tomahawk WiFi', 229.99, '{
  "socket": "AM5",
  "chipset": "B650",
  "form_factor": "ATX",
  "ram_type": "DDR5",
  "ram_slots": 4,
  "max_ram_gb": 128,
  "m2_slots": 2
}'::jsonb),
('motherboard', 'Gigabyte B650M DS3H', 'Gigabyte', 'B650M DS3H', 119.99, '{
  "socket": "AM5",
  "chipset": "B650",
  "form_factor": "Micro-ATX",
  "ram_type": "DDR5",
  "ram_slots": 2,
  "max_ram_gb": 64,
  "m2_slots": 2
}'::jsonb),
-- AMD B550 (AM4)
('motherboard', 'MSI MAG B550 Tomahawk', 'MSI', 'MAG B550 Tomahawk', 169.99, '{
  "socket": "AM4",
  "chipset": "B550",
  "form_factor": "ATX",
  "ram_type": "DDR4",
  "ram_slots": 4,
  "max_ram_gb": 128,
  "m2_slots": 2
}'::jsonb),
('motherboard', 'ASUS TUF Gaming B550-PLUS', 'ASUS', 'TUF Gaming B550-PLUS', 149.99, '{
  "socket": "AM4",
  "chipset": "B550",
  "form_factor": "ATX",
  "ram_type": "DDR4",
  "ram_slots": 4,
  "max_ram_gb": 128,
  "m2_slots": 2
}'::jsonb);

-- ============================================================================
-- RAM
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
-- DDR5
('ram', 'G.Skill Trident Z5 RGB 32GB DDR5-6000', 'G.Skill', 'Trident Z5 RGB', 159.99, '{
  "type": "DDR5",
  "capacity_gb": 32,
  "modules": 2,
  "speed_mhz": 6000,
  "cas_latency": "CL30"
}'::jsonb),
('ram', 'Corsair Vengeance DDR5-5600 32GB', 'Corsair', 'Vengeance', 109.99, '{
  "type": "DDR5",
  "capacity_gb": 32,
  "modules": 2,
  "speed_mhz": 5600,
  "cas_latency": "CL36"
}'::jsonb),
('ram', 'Kingston Fury Beast DDR5-6000 64GB', 'Kingston', 'Fury Beast', 219.99, '{
  "type": "DDR5",
  "capacity_gb": 64,
  "modules": 2,
  "speed_mhz": 6000,
  "cas_latency": "CL30"
}'::jsonb),
('ram', 'TeamGroup T-Force Delta RGB DDR5-6400 32GB', 'TeamGroup', 'T-Force Delta RGB', 139.99, '{
  "type": "DDR5",
  "capacity_gb": 32,
  "modules": 2,
  "speed_mhz": 6400,
  "cas_latency": "CL32"
}'::jsonb),
-- DDR4
('ram', 'G.Skill Trident Z Neo 32GB DDR4-3600', 'G.Skill', 'Trident Z Neo', 89.99, '{
  "type": "DDR4",
  "capacity_gb": 32,
  "modules": 2,
  "speed_mhz": 3600,
  "cas_latency": "CL16"
}'::jsonb),
('ram', 'Corsair Vengeance LPX 16GB DDR4-3200', 'Corsair', 'Vengeance LPX', 49.99, '{
  "type": "DDR4",
  "capacity_gb": 16,
  "modules": 2,
  "speed_mhz": 3200,
  "cas_latency": "CL16"
}'::jsonb),
('ram', 'Kingston Fury Beast DDR4-3200 32GB', 'Kingston', 'Fury Beast', 69.99, '{
  "type": "DDR4",
  "capacity_gb": 32,
  "modules": 2,
  "speed_mhz": 3200,
  "cas_latency": "CL16"
}'::jsonb);

-- ============================================================================
-- Storage
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
('storage', 'Samsung 990 Pro 2TB NVMe', 'Samsung', '990 Pro', 179.99, '{
  "type": "NVMe",
  "capacity_gb": 2000,
  "interface": "PCIe 4.0 x4",
  "read_speed": 7450,
  "write_speed": 6900
}'::jsonb),
('storage', 'Samsung 990 Pro 1TB NVMe', 'Samsung', '990 Pro', 109.99, '{
  "type": "NVMe",
  "capacity_gb": 1000,
  "interface": "PCIe 4.0 x4",
  "read_speed": 7450,
  "write_speed": 6900
}'::jsonb),
('storage', 'WD Black SN850X 2TB', 'Western Digital', 'SN850X', 169.99, '{
  "type": "NVMe",
  "capacity_gb": 2000,
  "interface": "PCIe 4.0 x4",
  "read_speed": 7300,
  "write_speed": 6600
}'::jsonb),
('storage', 'Crucial T500 1TB NVMe', 'Crucial', 'T500', 94.99, '{
  "type": "NVMe",
  "capacity_gb": 1000,
  "interface": "PCIe 4.0 x4",
  "read_speed": 7300,
  "write_speed": 6800
}'::jsonb),
('storage', 'Samsung 870 EVO 1TB SATA', 'Samsung', '870 EVO', 89.99, '{
  "type": "SATA SSD",
  "capacity_gb": 1000,
  "interface": "SATA III",
  "read_speed": 560,
  "write_speed": 530
}'::jsonb),
('storage', 'Seagate Barracuda 4TB HDD', 'Seagate', 'Barracuda', 79.99, '{
  "type": "HDD",
  "capacity_gb": 4000,
  "interface": "SATA III",
  "read_speed": 190,
  "write_speed": 190
}'::jsonb);

-- ============================================================================
-- PSUs
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
('psu', 'Corsair RM1000x 1000W 80+ Gold', 'Corsair', 'RM1000x', 189.99, '{
  "wattage": 1000,
  "efficiency": "80+ Gold",
  "modular": "Full",
  "form_factor": "ATX"
}'::jsonb),
('psu', 'Corsair RM850x 850W 80+ Gold', 'Corsair', 'RM850x', 139.99, '{
  "wattage": 850,
  "efficiency": "80+ Gold",
  "modular": "Full",
  "form_factor": "ATX"
}'::jsonb),
('psu', 'EVGA SuperNOVA 750 G7', 'EVGA', 'SuperNOVA G7', 109.99, '{
  "wattage": 750,
  "efficiency": "80+ Gold",
  "modular": "Full",
  "form_factor": "ATX"
}'::jsonb),
('psu', 'Seasonic Focus GX-650', 'Seasonic', 'Focus GX-650', 89.99, '{
  "wattage": 650,
  "efficiency": "80+ Gold",
  "modular": "Full",
  "form_factor": "ATX"
}'::jsonb),
('psu', 'be quiet! Pure Power 12 M 550W', 'be quiet!', 'Pure Power 12 M', 79.99, '{
  "wattage": 550,
  "efficiency": "80+ Gold",
  "modular": "Semi",
  "form_factor": "ATX"
}'::jsonb),
('psu', 'Corsair HX1500i 1500W 80+ Platinum', 'Corsair', 'HX1500i', 369.99, '{
  "wattage": 1500,
  "efficiency": "80+ Platinum",
  "modular": "Full",
  "form_factor": "ATX"
}'::jsonb);

-- ============================================================================
-- Cases
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
('case', 'NZXT H510 Flow', 'NZXT', 'H510 Flow', 89.99, '{
  "form_factor": ["ATX", "Micro-ATX", "Mini-ITX"],
  "max_gpu_length": 360,
  "max_cooler_height": 165,
  "drive_bays_25": 2,
  "drive_bays_35": 2
}'::jsonb),
('case', 'Fractal Design Meshify 2 Compact', 'Fractal Design', 'Meshify 2 Compact', 129.99, '{
  "form_factor": ["ATX", "Micro-ATX", "Mini-ITX"],
  "max_gpu_length": 360,
  "max_cooler_height": 169,
  "drive_bays_25": 4,
  "drive_bays_35": 2
}'::jsonb),
('case', 'Lian Li O11 Dynamic EVO', 'Lian Li', 'O11 Dynamic EVO', 169.99, '{
  "form_factor": ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"],
  "max_gpu_length": 420,
  "max_cooler_height": 167,
  "drive_bays_25": 6,
  "drive_bays_35": 4
}'::jsonb),
('case', 'Corsair 4000D Airflow', 'Corsair', '4000D Airflow', 104.99, '{
  "form_factor": ["ATX", "Micro-ATX", "Mini-ITX"],
  "max_gpu_length": 360,
  "max_cooler_height": 170,
  "drive_bays_25": 2,
  "drive_bays_35": 2
}'::jsonb),
('case', 'Phanteks Eclipse G360A', 'Phanteks', 'Eclipse G360A', 89.99, '{
  "form_factor": ["ATX", "Micro-ATX", "Mini-ITX"],
  "max_gpu_length": 400,
  "max_cooler_height": 163,
  "drive_bays_25": 2,
  "drive_bays_35": 2
}'::jsonb),
('case', 'Cooler Master NR200P', 'Cooler Master', 'NR200P', 109.99, '{
  "form_factor": ["Mini-ITX"],
  "max_gpu_length": 330,
  "max_cooler_height": 155,
  "drive_bays_25": 3,
  "drive_bays_35": 0
}'::jsonb);

-- ============================================================================
-- Cooling
-- ============================================================================
INSERT INTO components (type, name, brand, model, price, specs) VALUES
('cooling', 'Noctua NH-D15', 'Noctua', 'NH-D15', 109.99, '{
  "type": "Air",
  "height_mm": 165,
  "tdp_rating": 250,
  "socket_support": ["LGA1700", "AM5", "AM4"]
}'::jsonb),
('cooling', 'be quiet! Dark Rock Pro 4', 'be quiet!', 'Dark Rock Pro 4', 89.99, '{
  "type": "Air",
  "height_mm": 162,
  "tdp_rating": 250,
  "socket_support": ["LGA1700", "AM5", "AM4"]
}'::jsonb),
('cooling', 'Corsair iCUE H150i Elite LCD XT', 'Corsair', 'H150i Elite LCD XT', 289.99, '{
  "type": "AIO",
  "radiator_size": 360,
  "tdp_rating": 350,
  "socket_support": ["LGA1700", "AM5", "AM4"]
}'::jsonb),
('cooling', 'NZXT Kraken X63 RGB', 'NZXT', 'Kraken X63 RGB', 179.99, '{
  "type": "AIO",
  "radiator_size": 280,
  "tdp_rating": 280,
  "socket_support": ["LGA1700", "AM5", "AM4"]
}'::jsonb),
('cooling', 'Arctic Liquid Freezer II 240', 'Arctic', 'Liquid Freezer II 240', 99.99, '{
  "type": "AIO",
  "radiator_size": 240,
  "tdp_rating": 250,
  "socket_support": ["LGA1700", "AM5", "AM4"]
}'::jsonb),
('cooling', 'Cooler Master Hyper 212 EVO V2', 'Cooler Master', 'Hyper 212 EVO V2', 44.99, '{
  "type": "Air",
  "height_mm": 159,
  "tdp_rating": 150,
  "socket_support": ["LGA1700", "AM5", "AM4"]
}'::jsonb);
