create table block (
	id serial primary key,
	hash varchar not null,
	parent_hash varchar not null,
	number bigint not null unique,
	timestamp bigint not null,
	nonce varchar not null,
	difficulty bigint null,
	gas_limit bigint not null,
	gas_used bigint not null,
	miner varchar null,
	extra_data varchar null,
	wei_spent numeric(25, 0) not null
);

create table transaction (
	id serial primary key,
	block_id integer not null references block(id),
	hash varchar not null
);
