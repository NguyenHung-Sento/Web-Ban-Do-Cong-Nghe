CREATE TABLE IF NOT EXISTS `cellphones_db`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `role` ENUM('user', 'admin') NULL DEFAULT 'user',
  `google_id` VARCHAR(255) NULL DEFAULT NULL,
  `facebook_id` VARCHAR(255) NULL DEFAULT NULL,
  `profile_picture` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `image` VARCHAR(255) NULL DEFAULT NULL COMMENT 'URL hình ảnh từ Cloudinary',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug` (`slug` ASC) VISIBLE);
  
CREATE TABLE IF NOT EXISTS `cellphones_db`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `sale_price` DECIMAL(10,2) NULL DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT '0',
  `category_id` INT NULL DEFAULT NULL,
  `brand` VARCHAR(100) NULL DEFAULT NULL,
  `image` VARCHAR(255) NULL DEFAULT NULL COMMENT 'URL hình ảnh từ Cloudinary',
  `images` JSON NULL DEFAULT NULL COMMENT 'Mảng các URL hình ảnh từ Cloudinary',
  `specifications` JSON NULL DEFAULT NULL,
  `featured` TINYINT(1) NULL DEFAULT '0',
  `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `variants` JSON NULL DEFAULT NULL COMMENT 'Lưu trữ các biến thể của sản phẩm (màu sắc, dung lượng, cấu hình)',
  `review_count` INT NULL DEFAULT '0',
  `rating` DECIMAL(3,2) NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug` (`slug` ASC) VISIBLE,
  INDEX `category_id` (`category_id` ASC) VISIBLE,
  CONSTRAINT `products_ibfk_1`
    FOREIGN KEY (`category_id`)
    REFERENCES `cellphones_db`.`categories` (`id`)
    ON DELETE SET NULL);
  
CREATE TABLE IF NOT EXISTS `cellphones_db`.`orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL DEFAULT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NULL DEFAULT 'pending',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `payment_status` ENUM('pending', 'paid', 'failed') NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_details` JSON NULL DEFAULT NULL COMMENT 'Lưu trữ thông tin chi tiết về thanh toán',
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `orders_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `cellphones_db`.`users` (`id`)
    ON DELETE SET NULL);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `options` JSON NULL DEFAULT NULL COMMENT 'Lưu trữ các tùy chọn của sản phẩm (màu sắc, dung lượng, cấu hình)',
  PRIMARY KEY (`id`),
  INDEX `order_id` (`order_id` ASC) VISIBLE,
  INDEX `product_id` (`product_id` ASC) VISIBLE,
  CONSTRAINT `order_items_ibfk_1`
    FOREIGN KEY (`order_id`)
    REFERENCES `cellphones_db`.`orders` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2`
    FOREIGN KEY (`product_id`)
    REFERENCES `cellphones_db`.`products` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`product_variants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `variant_key` VARCHAR(255) NOT NULL COMMENT 'Khóa định danh biến thể, ví dụ: color:red|storage:128gb',
  `variant_name` VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị của biến thể, ví dụ: Đỏ, 128GB',
  `sku` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Mã SKU của biến thể',
  `price` DECIMAL(15,2) NULL DEFAULT NULL COMMENT 'Giá của biến thể, NULL nếu dùng giá mặc định của sản phẩm',
  `stock` INT NOT NULL DEFAULT '0' COMMENT 'Số lượng tồn kho của biến thể',
  `image` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Hình ảnh của biến thể',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `product_id` (`product_id` ASC, `variant_key` ASC) VISIBLE,
  CONSTRAINT `product_variants_ibfk_1`
    FOREIGN KEY (`product_id`)
    REFERENCES `cellphones_db`.`products` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`carts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `carts_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `cellphones_db`.`users` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`cart_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cart_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `options` JSON NULL DEFAULT NULL COMMENT 'Lưu trữ các tùy chọn của sản phẩm (màu sắc, dung lượng, cấu hình)',
  `variant_image` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `cart_id` (`cart_id` ASC) VISIBLE,
  INDEX `product_id` (`product_id` ASC) VISIBLE,
  CONSTRAINT `cart_items_ibfk_1`
    FOREIGN KEY (`cart_id`)
    REFERENCES `cellphones_db`.`carts` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2`
    FOREIGN KEY (`product_id`)
    REFERENCES `cellphones_db`.`products` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `payment_provider` VARCHAR(50) NULL DEFAULT NULL,
  `transaction_id` VARCHAR(100) NULL DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'refunded') NULL DEFAULT 'pending',
  `payment_data` JSON NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `order_id` (`order_id` ASC) VISIBLE,
  CONSTRAINT `payments_ibfk_1`
    FOREIGN KEY (`order_id`)
    REFERENCES `cellphones_db`.`orders` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`refresh_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_token` (`token` ASC) VISIBLE,
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `refresh_tokens_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `cellphones_db`.`users` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `address_text` TEXT NOT NULL,
  `is_default` TINYINT(1) NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id` ASC) VISIBLE,
  INDEX `idx_default` (`user_id` ASC, `is_default` ASC) VISIBLE,
  CONSTRAINT `addresses_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `cellphones_db`.`users` (`id`)
    ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `user_id` INT NULL DEFAULT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `parent_id` INT NULL DEFAULT NULL,
  `is_admin_reply` TINYINT(1) NULL DEFAULT '0',
  `product_variant_details` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `product_id` (`product_id` ASC) VISIBLE,
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  INDEX `fk_review_parent` (`parent_id` ASC) VISIBLE,
  CONSTRAINT `fk_review_parent`
    FOREIGN KEY (`parent_id`)
    REFERENCES `cellphones_db`.`reviews` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_1`
    FOREIGN KEY (`product_id`)
    REFERENCES `cellphones_db`.`products` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2`
    FOREIGN KEY (`user_id`)
    REFERENCES `cellphones_db`.`users` (`id`)
    ON DELETE SET NULL);
    
CREATE TABLE IF NOT EXISTS `cellphones_db`.`email_verification` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `registration_data` JSON NULL DEFAULT NULL,
  `otp` VARCHAR(6) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_email` (`email` ASC) VISIBLE);

CREATE TABLE IF NOT EXISTS `cellphones_db`.`bank_accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bank_name` VARCHAR(100) NOT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_holder` VARCHAR(100) NOT NULL,
  `bank_branch` VARCHAR(100) NULL DEFAULT NULL,
  `qr_code` VARCHAR(255) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));
  
CREATE TABLE IF NOT EXISTS `cellphones_db`.`banners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(500) NULL DEFAULT NULL,
  `button_text` VARCHAR(50) NULL DEFAULT NULL,
  `position` INT NULL DEFAULT '0',
  `is_active` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));
  

