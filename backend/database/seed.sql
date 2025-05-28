USE cellphones_db;

-- Tạo dữ liệu mẫu cho danh mục
INSERT INTO categories (name, slug, image) VALUES
('Điện thoại', 'dien-thoai', 'category-smartphones.jpg'),
('Máy tính bảng', 'may-tinh-bang', 'category-tablets.jpg'),
('Laptop', 'laptop', 'category-laptops.jpg'),
('Phụ kiện', 'phu-kien', 'category-accessories.jpg'),
('Đồng hồ thông minh', 'dong-ho-thong-minh', 'category-smartwatches.jpg');

INSERT INTO products (name, slug, description, price, sale_price, stock, category_id, brand, image, specifications, featured, status) VALUES
      ('iPhone 13 Pro', 'iphone-13-pro', 'iPhone mới nhất với hệ thống camera chuyên nghiệp', 29990000, 28990000, 50, 1, 'Apple', 'iphone-13-pro.jpg', '{"display":"6.1-inch","processor":"A15 Bionic","camera":"12MP"}', 1, 'active'),
      ('Samsung Galaxy S21', 'samsung-galaxy-s21', 'Điện thoại flagship của Samsung', 19990000, 18990000, 30, 1, 'Samsung', 'samsung-s21.jpg', '{"display":"6.2-inch","processor":"Exynos 2100","camera":"64MP"}', 1, 'active'),
      ('iPad Pro', 'ipad-pro', 'Máy tính bảng mạnh mẽ cho người dùng chuyên nghiệp', 22990000, NULL, 20, 2, 'Apple', 'ipad-pro.jpg', '{"display":"11-inch","processor":"M1","storage":"128GB"}', 0, 'active'),
      ('MacBook Air', 'macbook-air', 'Laptop mỏng nhẹ', 28990000, 26990000, 15, 3, 'Apple', 'macbook-air.jpg', '{"display":"13.3-inch","processor":"M1","storage":"256GB"}', 1, 'active'),
      ('AirPods Pro', 'airpods-pro', 'Tai nghe không dây với khả năng chống ồn', 5990000, 4990000, 100, 4, 'Apple', 'airpods-pro.jpg', '{"type":"In-ear","battery":"4.5 hours","features":"ANC"}', 0, 'active'),
      ('Apple Watch Series 7', 'apple-watch-series-7', 'Apple Watch mới nhất với màn hình lớn hơn', 10990000, 9990000, 25, 5, 'Apple', 'apple-watch-7.jpg', '{"display":"41mm/45mm","battery":"18 hours","features":"ECG, Blood Oxygen"}', 1, 'active'),
      ('Samsung Galaxy Watch 4', 'samsung-galaxy-watch-4', 'Đồng hồ thông minh với tính năng theo dõi sức khỏe nâng cao', 6990000, 5990000, 20, 5, 'Samsung', 'galaxy-watch-4.jpg', '{"display":"40mm/44mm","battery":"40 hours","features":"Body Composition"}', 0, 'active'),
      ('Google Pixel 6', 'google-pixel-6', 'Điện thoại Google với camera tuyệt vời', 15990000, 14990000, 15, 1, 'Google', 'pixel-6.jpg', '{"display":"6.4-inch","processor":"Google Tensor","camera":"50MP"}', 1, 'active'),
      ('Samsung Galaxy Tab S7', 'samsung-galaxy-tab-s7', 'Máy tính bảng Android cao cấp', 16990000, 15990000, 10, 2, 'Samsung', 'galaxy-tab-s7.jpg', '{"display":"11-inch","processor":"Snapdragon 865+","storage":"128GB"}', 0, 'active'),
      ('Dell XPS 13', 'dell-xps-13', 'Laptop cao cấp với màn hình InfinityEdge', 32990000, 30990000, 8, 3, 'Dell', 'dell-xps-13.jpg', '{"display":"13.4-inch","processor":"Intel i7","storage":"512GB"}', 0, 'active');
-- iPhone 13 Pro (ID: 1)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743511682/Product-Images/iphone-13-pro_vn4ywl.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743652881/Product-Images/iphone-13-pro-max-8_1_psucp0.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743653115/Product-Images/iphone-13-pro-max-10_1_fs28qx.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743653218/Product-Images/iphone-13-pro-max-9_1_ilgici.jpg'
)
WHERE id = 1;

-- Samsung Galaxy S21 (ID: 2)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743511877/Product-Images/samsung-galaxy-s21-plus-1_4_gbtrzs.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743656820/Product-Images/samsung-galaxy-s21-plus-1_3_zfcvsv.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743656880/Product-Images/samsung-galaxy-s21-plus-5_3_y1y9io.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743656964/Product-Images/samsung-galaxy-s21-plus-13_2_dwdgsb.jpg'
)
WHERE id = 2;

-- iPad Pro (ID: 3)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512004/Product-Images/ipad-mini-6_1__pyiphs.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743657579/Product-Images/ipad-1_kfvvmx.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743657658/Product-Images/ipad-2_z57myd.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743657721/Product-Images/ipad-3_srn5yd.jpg'
)
WHERE id = 3;

-- MacBook Air (ID: 4)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512910/Product-Images/mac1_74_10_2_toyqgo.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658327/Product-Images/mac-1_suyrlz.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658325/Product-Images/mac-2_jrjewa.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658323/Product-Images/mac-3_tcgmrn.jpg'
)
WHERE id = 4;

-- AirPods Pro (ID: 5)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512306/Product-Images/apple-airpods-pro-2-usb-c_8__ynt1ig.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658472/Product-Images/airpod-1_f4frgy.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658470/Product-Images/airpod-2_u6oatm.jpg'
)
WHERE id = 5;

-- Apple Watch Series 7 (ID: 6)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512402/Product-Images/apple_watch_series_7_gps_41mm_midnight_aluminum_midnight_sport_band_34fr_screen__usen_copy_4_2_1_hked76.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658731/Product-Images/apple-w-1_kbxdbx.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658733/Product-Images/apple-w-2_qxayla.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658735/Product-Images/apple-w-3_qh29ow.jpg'
)
WHERE id = 6;

-- Samsung Galaxy Watch 4 (ID: 7)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512529/Product-Images/003_galaxywatch4classic_black_r_perspective_1_2_1_1_z4goo8.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658869/Product-Images/gala-w-1_tdo5kc.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743658871/Product-Images/gala-w-2_gtegdh.jpg'
)
WHERE id = 7;

-- Google Pixel 6 (ID: 8)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512657/Product-Images/gggg_1__1_qjeslj.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659142/Product-Images/google-pixel-6-15.jpg_kyul7q.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659146/Product-Images/google-pixel-6-9.jpg_r4pvkk.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659144/Product-Images/google-pixel-6-7.jpg_ndhdzl.jpg'
)
WHERE id = 8;

-- Samsung Galaxy Tab S7 (ID: 9)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512703/Product-Images/samsung-galaxy-tab-s7-fe-chinh-hang_1_1_1_v41arh.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659274/Product-Images/tabs-1_hnets8.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659277/Product-Images/tabs-2_y8yioh.jpg'
)
WHERE id = 9;

-- Dell XPS 13 (ID: 10)
UPDATE products 
SET images = JSON_ARRAY(
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743512848/Product-Images/laptop-dell-xps-13-9310-i7-jgnh61_6__sxvcfi.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659387/Product-Images/xps-1_vlpf5o.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659389/Product-Images/xps-2_maw1yc.jpg',
  'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743659392/Product-Images/xps-3_epeqyu.jpgorder_items'
)
WHERE id = 10;


-- Update iPhone 13 Pro variants with color images
UPDATE products 
SET variants = JSON_SET(
  variants,
  '$.colors[0].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743511682/Product-Images/iphone-13-pro_vn4ywl.jpg',
  '$.colors[1].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743653502/Product-Images/iphone-13-silver_zmvuxb.jpg',
  '$.colors[2].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743653380/Product-Images/iphone-13-gold_p4vzwp.jpg',
  '$.colors[3].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743653526/Product-Images/iphone-13-graphite_fqe3fv.jpg'
)
WHERE id = 1;

-- Update Samsung Galaxy S21 variants with color images
UPDATE products 
SET variants = JSON_SET(
  variants,
  '$.colors[0].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743511877/Product-Images/samsung-galaxy-s21-plus-1_4_gbtrzs.jpg',
  '$.colors[1].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743657234/Product-Images/s21-xam_ovj58k.jpg',
  '$.colors[2].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743657298/Product-Images/s21-trang_dbcfal.jpg',
  '$.colors[3].image', 'https://res.cloudinary.com/dhfg8qs1o/image/upload/v1743657391/Product-Images/s21-hong_xofaky.jpg'
)
WHERE id = 2;


-- Thêm dữ liệu mẫu cho ngân hàng
INSERT INTO bank_accounts (bank_name, account_number, account_holder, bank_branch, qr_code) VALUES
('VPBank', '0325678611', 'CÔNG TY CỔ PHẦN DIGITALW', 'Chi nhánh Hà Nội', 'vpbank_qr.png'),
('Vietcombank', '1234567890', 'CÔNG TY CỔ PHẦN DIGITALW', 'Chi nhánh Đà Nẵng', 'vietcombank_qr.png'),
('Techcombank', '0987654321', 'CÔNG TY CỔ PHẦN DIGITALW', 'Chi nhánh TP.HCM', 'techcombank_qr.png'),
('BIDV', '1122334455', 'CÔNG TY CỔ PHẦN DIGITALW', 'Chi nhánh Đà Nẵng', 'bidv_qr.png'),
('MB Bank', '5566778899', 'CÔNG TY CỔ PHẦN DIGITALW', 'Chi nhánh Cần Thơ', 'mbbank_qr.png');


-- Tạo tài khoản admin mặc định (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '$2b$10$3NzT4GyQlQfzH1fUkVjIFOxY7NvU1MjP1TANL7GTsKQEGKulSRyES', 'admin');


