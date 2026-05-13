/*
  Warnings:

  - You are about to drop the column `addeed_by_editor_id` on the `editor_playlist_tracks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `editor_playlists` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `added_by_editor_id` to the `editor_playlist_tracks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `editor_playlists` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "editor_playlist_tracks" DROP CONSTRAINT "editor_playlist_tracks_addeed_by_editor_id_fkey";

-- AlterTable
ALTER TABLE "editor_playlist_tracks" DROP COLUMN "addeed_by_editor_id",
ADD COLUMN     "added_by_editor_id" VARCHAR(32) NOT NULL;

-- AlterTable
ALTER TABLE "editor_playlists" ADD COLUMN     "slug" VARCHAR(256) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "editor_playlist_slug_idx" ON "editor_playlists"("slug");

-- AddForeignKey
ALTER TABLE "editor_playlist_tracks" ADD CONSTRAINT "editor_playlist_tracks_added_by_editor_id_fkey" FOREIGN KEY ("added_by_editor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
