drop TRIGGER addTotalLevel
drop TRIGGER addTotalLevelUpdate
--drop TRIGGER addTotalLevelDeleted
--update total level when you insert data to dictionary
CREATE TRIGGER addTotalLevel ON Dictionary
FOR INSERT
AS
begin 
	update Theme
	set Theme.TotalLevel =  (Select count(distinct(Level)) from Dictionary where theme_ID = (select theme_ID from inserted))
	where Theme.ID = (select theme_ID from inserted)
end

--update total level when you update data to dictionary
CREATE TRIGGER addTotalLevelUpdate ON Dictionary
FOR UPDATE
AS
begin 
	update Theme
	set Theme.TotalLevel =  (Select count(distinct(Level)) from Dictionary where theme_ID = (select theme_ID from inserted))
	where Theme.ID = (select theme_ID from inserted)
end

--update total level when you delete data to dictionary

CREATE TRIGGER addTotalLevelDeleted ON Dictionary
instead of DELETE
AS
begin 
	declare @themeIDDeleted int
	set @themeIDDeleted = (select theme_ID from deleted)

	print(@themeIDDeleted)
	delete from Dictionary where Dictionary.ID = (select ID from deleted)

	update Theme
	set Theme.TotalLevel =  (Select Max(Level) from Dictionary where theme_ID = @themeIDDeleted)
	where Theme.ID = @themeIDDeleted
end

alter table Dictionary 
alter COLUMN  Example nvarchar(250)
alter table [Dictionary]
alter column IPA varchar(250) COLLATE Latin1_General_100_CI_AI_SC_UTF8;

declare @id int
set @id=2
while @id<=53	
begin
	update Dictionary 
	set [Example] = 'this is Example'
	where ID = @id

	set @id = @id + 1
end

