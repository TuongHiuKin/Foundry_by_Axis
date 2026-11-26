-- Cấu trúc database của Foundry.
-- File này được chạy mỗi lần server khởi động.
-- Dùng "IF NOT EXISTS" nên chạy nhiều lần cũng không sao.

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user', -- 'user' hoặc 'admin'
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sản phẩm do tác giả (author) đăng lên để mọi người dùng thử và góp ý.
CREATE TABLE IF NOT EXISTS products (
    id          BIGSERIAL PRIMARY KEY,
    author_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    link        TEXT NOT NULL DEFAULT '',  -- link dùng thử sản phẩm
    image_url   TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '',  -- ví dụ: "game,web,ai"
    views       INT  NOT NULL DEFAULT 0,
    hidden      BOOLEAN NOT NULL DEFAULT false, -- admin ẩn sản phẩm vi phạm
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Góp ý của người dùng cho một sản phẩm.
CREATE TABLE IF NOT EXISTS feedbacks (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section    TEXT NOT NULL DEFAULT 'chung', -- góp ý theo mục: giao diện, tính năng, lỗi...
    rating     INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Báo cáo vi phạm (spam, nội dung xấu...) gửi cho admin xử lý.
CREATE TABLE IF NOT EXISTS reports (
    id          BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
    feedback_id BIGINT REFERENCES feedbacks(id) ON DELETE CASCADE,
    reason      TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open', -- 'open' hoặc 'resolved'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
