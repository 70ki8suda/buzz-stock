-- CreateTable
CREATE TABLE "_UserRelation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserRelation_AB_unique" ON "_UserRelation"("A", "B");

-- CreateIndex
CREATE INDEX "_UserRelation_B_index" ON "_UserRelation"("B");

-- AddForeignKey
ALTER TABLE "_UserRelation" ADD FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRelation" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
