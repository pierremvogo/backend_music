-- CreateEnum
CREATE TYPE "CURATION" AS ENUM ('MANUAL', 'ALGORITHMIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED', 'SHEDULED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ARTIST', 'FAN', 'USER', 'EDITOR');

-- CreateTable
CREATE TABLE "albums" (
    "id" VARCHAR(32) NOT NULL,
    "authors" VARCHAR(512) NOT NULL,
    "producers" VARCHAR(512) NOT NULL,
    "lyricists" VARCHAR(512) NOT NULL,
    "musicians_vocals" VARCHAR(512),
    "musicians_piano_keyboards" VARCHAR(512),
    "musicians_winds" VARCHAR(512),
    "musicians_percussion" VARCHAR(512),
    "musicians_strings" VARCHAR(512),
    "mixing_engineer" VARCHAR(512),
    "mastering_engineer" VARCHAR(512),
    "release_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_payout_settings" (
    "id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "bank_account_holder" VARCHAR(256),
    "bank_name" VARCHAR(256),
    "account_number" VARCHAR(128),
    "routing_number" VARCHAR(64),
    "swift_code" VARCHAR(32),
    "iban" VARCHAR(64),
    "paypal_email" VARCHAR(256),
    "bizum_phone" VARCHAR(64),
    "mobile_money_provider" VARCHAR(64),
    "mobile_money_phone" VARCHAR(64),
    "orange_money_phone" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_payout_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_playlists" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" VARCHAR(256),
    "cover_image_url" VARCHAR(2048) NOT NULL,
    "banner_image_url" VARCHAR(2048),
    "locale" VARCHAR(16) NOT NULL DEFAULT 'en',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER DEFAULT 0,
    "genre" VARCHAR(256),
    "country" VARCHAR(256),
    "targetAudience" VARCHAR(256),
    "curationType" "CURATION" NOT NULL DEFAULT 'MANUAL',
    "created_by_user_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editor_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_playlist_tracks" (
    "id" VARCHAR(32) NOT NULL,
    "editor_playlist_id" VARCHAR(32) NOT NULL,
    "track_id" VARCHAR(32) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addeed_by_editor_id" VARCHAR(32) NOT NULL,

    CONSTRAINT "editor_playlist_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eps" (
    "id" VARCHAR(32) NOT NULL,
    "authors" VARCHAR(512) NOT NULL,
    "producers" VARCHAR(512) NOT NULL,
    "lyricists" VARCHAR(512) NOT NULL,
    "musicians_vocals" VARCHAR(512),
    "musicians_piano_keyboards" VARCHAR(512),
    "musicians_winds" VARCHAR(512),
    "musicians_percussion" VARCHAR(512),
    "musicians_strings" VARCHAR(512),
    "mixing_engineer" VARCHAR(512),
    "mastering_engineer" VARCHAR(512),
    "release_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" VARCHAR(32) NOT NULL,
    "artist_id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'EUR',
    "billing_cycle" VARCHAR(20) NOT NULL,
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "stripe_product_id" VARCHAR(64),
    "stripe_price_id" VARCHAR(64),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" VARCHAR(32) NOT NULL,
    "nom" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release" (
    "id" VARCHAR(32) NOT NULL,
    "artist_id" VARCHAR(32) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "duration" DOUBLE PRECISION DEFAULT 0,
    "cover_url" VARCHAR(256) NOT NULL,
    "cover_file_name" VARCHAR(255) NOT NULL,
    "release_date" VARCHAR(256) NOT NULL,
    "description" VARCHAR(256),
    "label" VARCHAR(256) NOT NULL,
    "release_type" VARCHAR(256) NOT NULL,
    "format" VARCHAR(256) NOT NULL,
    "upc_code" VARCHAR(256) NOT NULL,
    "status" "ReleaseStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_tags" (
    "id" VARCHAR(32) NOT NULL,
    "release_id" VARCHAR(32) NOT NULL,
    "tag_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "royalty_payouts" (
    "id" VARCHAR(32) NOT NULL,
    "artist_id" VARCHAR(32) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'EUR',
    "status" VARCHAR(20) NOT NULL DEFAULT 'paid',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "royalty_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "singles" (
    "id" VARCHAR(32) NOT NULL,
    "authors" VARCHAR(512) NOT NULL,
    "producers" VARCHAR(512) NOT NULL,
    "lyricists" VARCHAR(512) NOT NULL,
    "musicians_vocals" VARCHAR(512),
    "musicians_piano_keyboards" VARCHAR(512),
    "musicians_winds" VARCHAR(512),
    "musicians_percussion" VARCHAR(512),
    "musicians_strings" VARCHAR(512),
    "mixing_engineer" VARCHAR(512),
    "mastering_engineer" VARCHAR(512),
    "release_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "singles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "artist_id" VARCHAR(32) NOT NULL,
    "plan_id" VARCHAR(32) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'EUR',
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "stripe_customer_id" VARCHAR(64),
    "stripe_subscription_id" VARCHAR(64),
    "stripe_checkout_session_id" VARCHAR(128),
    "lygos_order_id" VARCHAR(128),
    "lygos_transaction_id" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testers" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "ageRange" VARCHAR(16) NOT NULL,
    "language" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" VARCHAR(32) NOT NULL,
    "isrc_code" VARCHAR(256) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "mood_id" VARCHAR(32) NOT NULL,
    "audio_url" VARCHAR(2048) NOT NULL,
    "audio_file_name" VARCHAR(255) NOT NULL,
    "lyrics" TEXT,
    "sign_language_video_url" VARCHAR(2048),
    "sign_language_file_name" VARCHAR(255),
    "braille_file_url" VARCHAR(2048),
    "braille_file_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_playlists" (
    "id" VARCHAR(32) NOT NULL,
    "playlist_id" VARCHAR(32) NOT NULL,
    "track_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_releases" (
    "id" VARCHAR(32) NOT NULL,
    "track_id" VARCHAR(32) NOT NULL,
    "release_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_streams" (
    "id" VARCHAR(32) NOT NULL,
    "track_id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "ip_address" VARCHAR(255),
    "country" VARCHAR(255),
    "city" VARCHAR(255),
    "device" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_tags" (
    "id" VARCHAR(32) NOT NULL,
    "track_id" VARCHAR(32) NOT NULL,
    "tag_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "subscription_id" VARCHAR(32),
    "amount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(256),
    "surname" VARCHAR(256),
    "videoIntroUrl" VARCHAR(512),
    "videoIntro_file_name" VARCHAR(255),
    "miniVideoLoopUrl" VARCHAR(512),
    "miniVideoLoop_file_name" VARCHAR(255),
    "username" VARCHAR(256),
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "profileImageUrl" VARCHAR(512),
    "profileImage_file_name" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "artistName" VARCHAR(256),
    "genre" VARCHAR(256),
    "bio" VARCHAR(1024),
    "country" VARCHAR(128),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" VARCHAR(256),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailTokenExpiresAt" TIMESTAMP(3),
    "passwordResetTokenHash" VARCHAR(256),
    "passwordResetExpiresAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tags" (
    "id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "tag_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "albums_release_id_key" ON "albums"("release_id");

-- CreateIndex
CREATE UNIQUE INDEX "artist_payout_settings_user_id_key" ON "artist_payout_settings"("user_id");

-- CreateIndex
CREATE INDEX "artist_payout_settings_artist_idx" ON "artist_payout_settings"("user_id");

-- CreateIndex
CREATE INDEX "editor_playlist_published_idx" ON "editor_playlists"("is_published");

-- CreateIndex
CREATE INDEX "editor_playlist_tracks_playlist_idx" ON "editor_playlist_tracks"("editor_playlist_id");

-- CreateIndex
CREATE INDEX "editor_playlist_tracks_position_idx" ON "editor_playlist_tracks"("position");

-- CreateIndex
CREATE UNIQUE INDEX "editor_playlist_track_unique" ON "editor_playlist_tracks"("editor_playlist_id", "track_id");

-- CreateIndex
CREATE UNIQUE INDEX "eps_release_id_key" ON "eps"("release_id");

-- CreateIndex
CREATE UNIQUE INDEX "mood_name_key" ON "mood"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mood_slug_idx" ON "mood"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripe_price_unique" ON "plans"("stripe_price_id");

-- CreateIndex
CREATE INDEX "plans_artist_id_idx" ON "plans"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_artist_cycle" ON "plans"("artist_id", "billing_cycle");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_slug_idx" ON "playlists"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "album_slug_idx" ON "release"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "release_tag_unique_idx" ON "release_tags"("release_id", "tag_id");

-- CreateIndex
CREATE INDEX "royalty_payouts_artist_id_idx" ON "royalty_payouts"("artist_id");

-- CreateIndex
CREATE INDEX "royalty_payouts_status_idx" ON "royalty_payouts"("status");

-- CreateIndex
CREATE INDEX "royalty_payouts_created_at_idx" ON "royalty_payouts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "singles_release_id_key" ON "singles"("release_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_sub_unique" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_checkout_unique" ON "subscriptions"("stripe_checkout_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_lygos_order_unique" ON "subscriptions"("lygos_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_lygos_transaction_unique" ON "subscriptions"("lygos_transaction_id");

-- CreateIndex
CREATE INDEX "subscriptions_artist_idx" ON "subscriptions"("artist_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_artist" ON "subscriptions"("user_id", "artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "track_slug_idx" ON "tracks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_track_unique_idx" ON "track_playlists"("playlist_id", "track_id");

-- CreateIndex
CREATE UNIQUE INDEX "track_release_unique" ON "track_releases"("track_id", "release_id");

-- CreateIndex
CREATE INDEX "track_streams_track_id_idx" ON "track_streams"("track_id");

-- CreateIndex
CREATE INDEX "track_streams_user_id_idx" ON "track_streams"("user_id");

-- CreateIndex
CREATE INDEX "track_streams_created_at_idx" ON "track_streams"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "track_tag_unique_idx" ON "track_tags"("track_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_unique_idx" ON "user_tags"("user_id", "tag_id");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_payout_settings" ADD CONSTRAINT "artist_payout_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_playlists" ADD CONSTRAINT "editor_playlists_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_playlist_tracks" ADD CONSTRAINT "editor_playlist_tracks_editor_playlist_id_fkey" FOREIGN KEY ("editor_playlist_id") REFERENCES "editor_playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_playlist_tracks" ADD CONSTRAINT "editor_playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_playlist_tracks" ADD CONSTRAINT "editor_playlist_tracks_addeed_by_editor_id_fkey" FOREIGN KEY ("addeed_by_editor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eps" ADD CONSTRAINT "eps_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_tags" ADD CONSTRAINT "release_tags_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_tags" ADD CONSTRAINT "release_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "royalty_payouts" ADD CONSTRAINT "royalty_payouts_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "singles" ADD CONSTRAINT "singles_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_mood_id_fkey" FOREIGN KEY ("mood_id") REFERENCES "mood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_playlists" ADD CONSTRAINT "track_playlists_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_playlists" ADD CONSTRAINT "track_playlists_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_releases" ADD CONSTRAINT "track_releases_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_releases" ADD CONSTRAINT "track_releases_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_streams" ADD CONSTRAINT "track_streams_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_streams" ADD CONSTRAINT "track_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_tags" ADD CONSTRAINT "track_tags_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_tags" ADD CONSTRAINT "track_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
