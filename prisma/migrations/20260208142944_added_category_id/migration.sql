-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "catagoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_catagoryId_fkey" FOREIGN KEY ("catagoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
