import { DatabaseOperationCommand, DatabaseOperationEnum } from './types';

const groupBy = (collection: unknown[] = [], key: string): { [key: string]: any[] } => {
  if (!key.length) {
    throw new Error('key is required');
  }

  return collection.reduce(function (rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {}) as { [key: string]: [] };
};

export const validateFindByCommandsFilter = <T>(filterList: DatabaseOperationCommand<T>[]) => {
  const groupList = groupBy(filterList, 'property');

  for (const key in groupList) {
    const commands = groupList[`${key}`].map((g) => g.command);
    const isLikeNotAllowedOperation = commands.filter(
      (g) => g === DatabaseOperationEnum.CONTAINS || g === DatabaseOperationEnum.NOT_CONTAINS
    );

    const NOT_ALLOWED_COMBINATION = 2;

    if (isLikeNotAllowedOperation.length === NOT_ALLOWED_COMBINATION) {
      throw new Error(
        `it is not possible to filter: '${key}' with the commands '${commands.join(', ')}'`
      );
    }

    const isEqualNotAllowedOperation = commands.filter(
      (g) => g === DatabaseOperationEnum.EQUAL || g === DatabaseOperationEnum.NOT_EQUAL
    );

    if (isEqualNotAllowedOperation.length === NOT_ALLOWED_COMBINATION) {
      throw new Error(
        `it is not possible to filter: '${key}' with the commands '${commands.join(', ')}'`
      );
    }
  }
};