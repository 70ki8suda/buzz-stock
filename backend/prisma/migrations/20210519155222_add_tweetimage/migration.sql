-- CreateTable
CREATE TABLE "TweetImage" (
    "id" SERIAL NOT NULL,
    "tweetId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TweetImage_tweetId_unique" ON "TweetImage"("tweetId");

-- AddForeignKey
ALTER TABLE "TweetImage" ADD FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
