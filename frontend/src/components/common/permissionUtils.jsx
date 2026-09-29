export const hasPermission = (
  moduleName,
  submoduleName,
  actionName
) => {
  const permissions = JSON.parse(
    localStorage.getItem("permissions") || "[]"
  );

  for (const permission of permissions) {
    const modules = permission.modules_submodule || [];

    const module = modules.find(
      (item) => item.moduleName === moduleName
    );

    if (!module) continue;

    const submodule = module.selectedSubmodules?.find(
      (item) => item.submoduleName === submoduleName
    );

    if (!submodule) return false;

    return submodule.selectedActions?.some(
      (action) => action.actionName === actionName
    );
  }

  return false;
};