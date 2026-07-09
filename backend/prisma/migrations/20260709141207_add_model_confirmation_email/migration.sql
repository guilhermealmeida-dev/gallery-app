-- CreateTable
CREATE TABLE "email-confirmation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "email-confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email-confirmation_token_key" ON "email-confirmation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email-confirmation_userid_key" ON "email-confirmation"("userid");

-- AddForeignKey
ALTER TABLE "email-confirmation" ADD CONSTRAINT "email-confirmation_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
