# Nestjs generic repositories

#### Generic repositories

- Mongoose
- TypeOrm
- Sequelize

# Usage

examples folder

-- App Skeleton

```

.
├── commitlint.config.js
├── database.json
├── docker-compose-infra.yml
├── docker-compose.yml
├── jest.config.ts
├── nest-cli.json
├── package.json
├── release.config.js
├── scripts
│ ├── mongo
│ │ ├── rs-init.sh
│ │ └── start-replicaset.sh
│ ├── npm-audit.sh
│ ├── postgres
│ │ └── create-database.sql
│ └── prometheus
│ ├── collector-config.yaml
│ └── config.yml
├── src
│ ├── app.module.ts
│ ├── core
│ │ ├── cats
│ │ │ ├── entity
│ │ │ │ └── cats.ts
│ │ │ ├── repository
│ │ │ │ └── cats.ts
│ │ │ └── use-cases
│ │ │ ├── **tests**
│ │ │ │ ├── cats-create.spec.ts
│ │ │ │ ├── cats-delete.spec.ts
│ │ │ │ ├── cats-list.spec.ts
│ │ │ │ ├── cats-update.spec.ts
│ │ │ │ └── user-getByID.spec.ts
│ │ │ ├── cats-create.ts
│ │ │ ├── cats-delete.ts
│ │ │ ├── cats-getByID.ts
│ │ │ ├── cats-list.ts
│ │ │ └── cats-update.ts
│ │ └── user
│ │ ├── entity
│ │ │ └── user.ts
│ │ ├── repository
│ │ │ └── user.ts
│ │ └── use-cases
│ │ ├── **tests**
│ │ │ ├── user-create.spec.ts
│ │ │ ├── user-delete.spec.ts
│ │ │ ├── user-getByID.spec.ts
│ │ │ ├── user-list.spec.ts
│ │ │ ├── user-login.spec.ts
│ │ │ ├── user-logout.spec.ts
│ │ │ └── user-update.spec.ts
│ │ ├── user-create.ts
│ │ ├── user-delete.ts
│ │ ├── user-getByID.ts
│ │ ├── user-list.ts
│ │ ├── user-login.ts
│ │ ├── user-logout.ts
│ │ └── user-update.ts
│ ├── infra
│ │ ├── cache
│ │ │ ├── adapter.ts
│ │ │ ├── index.ts
│ │ │ ├── memory
│ │ │ │ ├── index.ts
│ │ │ │ ├── module.ts
│ │ │ │ ├── service.ts
│ │ │ │ └── types.ts
│ │ │ ├── redis
│ │ │ │ ├── index.ts
│ │ │ │ ├── module.ts
│ │ │ │ ├── service.ts
│ │ │ │ └── types.ts
│ │ │ └── types.ts
│ │ ├── database
│ │ │ ├── adapter.ts
│ │ │ ├── enum.ts
│ │ │ ├── index.ts
│ │ │ ├── mongo
│ │ │ │ ├── index.ts
│ │ │ │ ├── module.ts
│ │ │ │ ├── schemas
│ │ │ │ │ └── user.ts
│ │ │ │ ├── seed
│ │ │ │ │ └── create-user-admin.ts
│ │ │ │ └── service.ts
│ │ │ ├── postgres
│ │ │ │ ├── config.ts
│ │ │ │ ├── index.ts
│ │ │ │ ├── migrations
│ │ │ │ │ └── 20230416174316-create-cats-table.js
│ │ │ │ ├── module.ts
│ │ │ │ ├── schemas
│ │ │ │ │ └── cats.ts
│ │ │ │ └── service.ts
│ │ │ └── types.ts
│ │ ├── http
│ │ │ ├── adapter.ts
│ │ │ ├── index.ts
│ │ │ ├── module.ts
│ │ │ └── service.ts
│ │ ├── logger
│ │ │ ├── adapter.ts
│ │ │ ├── index.ts
│ │ │ ├── module.ts
│ │ │ ├── service.ts
│ │ │ └── types.ts
│ │ ├── module.ts
│ │ ├── repository
│ │ │ ├── adapter.ts
│ │ │ ├── index.ts
│ │ │ ├── mongo
│ │ │ │ └── repository.ts
│ │ │ ├── postgres
│ │ │ │ └── repository.ts
│ │ │ └── types.ts
│ │ └── secrets
│ │ ├── adapter.ts
│ │ ├── index.ts
│ │ ├── module.ts
│ │ └── service.ts
│ ├── libs
│ │ └── auth
│ │ ├── adapter.ts
│ │ ├── index.ts
│ │ ├── module.ts
│ │ ├── service.ts
│ │ └── types.ts
│ ├── main.ts
│ ├── modules
│ │ ├── cats
│ │ │ ├── adapter.ts
│ │ │ ├── controller.ts
│ │ │ ├── module.ts
│ │ │ ├── repository.ts
│ │ │ └── swagger.ts
│ │ ├── health
│ │ │ ├── **tests**
│ │ │ │ └── controller.spec.ts
│ │ │ ├── controller.ts
│ │ │ └── module.ts
│ │ ├── login
│ │ │ ├── adapter.ts
│ │ │ ├── controller.ts
│ │ │ ├── module.ts
│ │ │ └── swagger.ts
│ │ ├── logout
│ │ │ ├── adapter.ts
│ │ │ ├── controller.ts
│ │ │ ├── module.ts
│ │ │ └── swagger.ts
│ │ └── user
│ │ ├── adapter.ts
│ │ ├── controller.ts
│ │ ├── module.ts
│ │ ├── repository.ts
│ │ └── swagger.ts
│ └── utils
│ ├── axios.ts
│ ├── database
│ │ ├── mongoose.ts
│ │ └── sequelize.ts
│ ├── decorators
│ │ ├── database
│ │ │ ├── mongo
│ │ │ │ ├── convert-mongoose-filter.decorator.ts
│ │ │ │ └── validate-mongoose-filter.decorator.ts
│ │ │ ├── postgres
│ │ │ │ ├── convert-paginate-input-to-sequelize-filter.decorator.ts
│ │ │ │ └── convert-sequelize-filter.decorator.ts
│ │ │ └── validate-database-sort-allowed.decorator.ts
│ │ ├── role.decorator.ts
│ │ ├── types.ts
│ │ └── validate-schema.decorator.ts
│ ├── docs
│ │ ├── data
│ │ │ ├── cats
│ │ │ │ ├── request.ts
│ │ │ │ └── response.ts
│ │ │ └── user
│ │ │ ├── request.ts
│ │ │ └── response.ts
│ │ └── swagger.ts
│ ├── entity.ts
│ ├── exception.ts
│ ├── filters
│ │ └── http-exception.filter.ts
│ ├── interceptors
│ │ ├── auth-guard.interceptor.ts
│ │ ├── http-exception.interceptor.ts
│ │ ├── http-logger.interceptor.ts
│ │ ├── metrics.interceptor.ts
│ │ └── tracing.interceptor.ts
│ ├── middlewares
│ │ └── is-logged.middleware.ts
│ ├── pagination.ts
│ ├── request.ts
│ ├── search.ts
│ ├── sort.ts
│ ├── static
│ │ └── htttp-status.json
│ ├── tests
│ │ ├── mocks
│ │ │ └── request.ts
│ │ └── tests.ts
│ └── tracing.ts
├── test
│ └── initializaion.ts
├── tsconfig.build.json
└── tsconfig.json

```

The following is a list of all the people that have contributed Nestjs monorepo boilerplate. Thanks for your contributions!

[<img alt="mikemajesty" src="https://avatars1.githubusercontent.com/u/11630212?s=460&v=4&s=117" width="117">](https://github.com/mikemajesty)

## License

It is available under the MIT license.
[License](https://opensource.org/licenses/mit-license.php)

```

---

The following is a list of all the people that have contributed Nestjs monorepo boilerplate. Thanks for your contributions!

[<img alt="mikemajesty" src="https://avatars1.githubusercontent.com/u/11630212?s=460&v=4&s=117" width="117">](https://github.com/mikemajesty)

## License

It is available under the MIT license.
[License](https://opensource.org/licenses/mit-license.php)
```
