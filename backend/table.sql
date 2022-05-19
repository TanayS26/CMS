create table user(
    id int primary key AUTO_INCREMENT,
    name varchar(255) not null,
    contactNumber varchar(20) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    status varchar(255) not null,
    role varchar(255) not null,
    UNIQUE (email)
);

insert into user(name, contactNumber, email, password, status, role) values('Admin', '+91 76070 70646', 'admin@gmail.com', 'admin', 'true', 'admin');


create table category(
    id int not null AUTO_INCREMENT,
    name varchar(255) not null,
    primary key (id)
);


create table product(
    id int not null AUTO_INCREMENT,
    name varchar(255) not null,
    categoryId integer not null,
    description varchar(255) not null,
    price integer not null,
    status varchar(255),
    primary key (id)

);


create table bill(
    id int not null AUTO_INCREMENT,
    uuid varchar(255) not null,
    name varchar(255) not null,
    email varchar(255) not null,
    contactNumber varchar(255) not null,
    paymentMethod varchar(255) not null,
    amount int not null,
    productDetails JSON DEFAULT NULL,
    createdBy varchar(255) not null,
    primary key (id)
);