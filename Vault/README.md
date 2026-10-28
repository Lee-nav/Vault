# Vault

Vault is a server-rendered PHP flashcard app. User accounts, private decks,
cards, companion progress, streaks, and treats are stored in MySQL. The
interface uses HTML forms and CSS; it does not require JavaScript.

## Requirements

- PHP 8.1 or newer
- PHP extensions: `pdo_mysql` and `mbstring`
- MySQL 5.7+ or a compatible MariaDB server
- Apache with `.htaccess` support, or equivalent hosting configuration

## Set up the database

Create a new, empty database in your hosting panel (or locally), then import
`database.sql` into that database. The SQL file intentionally does not create or
select a database, which allows it to work with shared-hosting database names.
Accounts are created from the site's sign-up page; each account gets private
decks, study progress, and starter tutorials. New passwords must be 12 to 72
bytes. Use the sign-in form on the landing page to return to an account.

For a local XAMPP installation, start MySQL in the XAMPP Manager, create the
empty `vault` database in phpMyAdmin, select it, then import `database.sql`. The
development defaults in `config.php` use XAMPP's default `root` account with
no password. If your local MySQL account differs, set the `VAULT_DB_*`
environment variables.

For another local MySQL installation:

```sh
mysql -u vault -p vault < database.sql
```

In phpMyAdmin, select the target database and use **Import** to upload
`database.sql`.

## Configure the app

`config.php` reads these environment variables:

- `VAULT_DB_HOST`
- `VAULT_DB_NAME`
- `VAULT_DB_USER`
- `VAULT_DB_PASSWORD`

Set them in your hosting control panel when available. Otherwise, update the
development defaults in `config.php` to the database host, name, username, and
password provided by your host. Do not publish production credentials.

For local development, serve this directory through a PHP-enabled web server;
for example:

```sh
php -S 127.0.0.1:8000
```

Then open `http://127.0.0.1:8000`. The PHP built-in server does not read
`.htaccess`; use Apache or the host's equivalent access rules in production.

## Shared hosting

Upload `index.php`, `config.php`, `style.css`, `.htaccess`, and `database.sql`
to the site's document root. Import the schema into the database created for
the site and configure the database credentials before visiting the site.
The directory index is set to `index.php`, so requests execute the application
instead of serving a static prototype.

Each visitor must create an account or sign in before accessing the vault.
Passwords are stored as PHP password hashes, and each account's decks and
progress are isolated in the database. Existing installations using the
previous shared-vault schema should export a JSON backup, create a new empty
database, import the updated `database.sql`, configure the app to use it, then
sign up and import the backup into that account. Do not import the new schema
over the old shared-vault tables.

## Backups

Use **Export JSON Backup** on the Decks page to download decks, cards, app
progress, and companion progress. Importing a backup replaces the existing
decks and restores the included progress. Keep a separate copy of important
backups before importing.
