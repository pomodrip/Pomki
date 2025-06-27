-- Comprehensive database migration script for Pomki application
-- Run this script in your MariaDB database to fix the schema issues

-- Step 1: Check current table structure
-- SHOW CREATE TABLE note_tag;
-- SHOW CREATE TABLE review_note;

-- Step 2: Drop existing foreign key constraints on note_tag table
-- (Replace FKai6670vcpyv88ps6jshsjn8r1 with the actual constraint name if different)
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the specific foreign key constraint
ALTER TABLE note_tag DROP FOREIGN KEY IF EXISTS FKai6670vcpyv88ps6jshsjn8r1;

-- Step 3: Ensure note_tag table has correct structure
-- Make sure note_id column is VARCHAR(50) NOT NULL
ALTER TABLE note_tag MODIFY COLUMN note_id VARCHAR(50) NOT NULL;

-- Step 4: Recreate foreign key constraint with proper naming
ALTER TABLE note_tag 
ADD CONSTRAINT FK_note_tag_note 
FOREIGN KEY (note_id) REFERENCES review_note(note_id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 6: Verify the changes
-- SHOW CREATE TABLE note_tag;
-- SHOW CREATE TABLE review_note;

-- Optional: Check for any other potential issues
-- SELECT * FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = 'pomki' 
-- AND TABLE_NAME = 'note_tag' 
-- AND REFERENCED_TABLE_NAME IS NOT NULL; 