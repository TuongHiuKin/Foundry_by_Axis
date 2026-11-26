package main

import (
	"context"
	_ "embed"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// db là "hồ kết nối" tới PostgreSQL, dùng chung cho cả chương trình.
var db *pgxpool.Pool

// Nhúng nội dung file schema.sql vào trong chương trình lúc build.
//
//go:embed schema.sql
var schemaSQL string

func connectDB(url string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var err error
	db, err = pgxpool.New(ctx, url)
	if err != nil {
		log.Fatalf("Không kết nối được database: %v", err)
	}
	if err = db.Ping(ctx); err != nil {
		log.Fatalf("Database không phản hồi: %v", err)
	}
	if _, err = db.Exec(ctx, schemaSQL); err != nil {
		log.Fatalf("Không tạo được bảng: %v", err)
	}
	log.Println("Đã kết nối database")
}
