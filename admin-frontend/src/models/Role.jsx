// models.js

// Class Feature
export class FeatureModels {
  constructor(id, name, is_deleted=false, created_at, updated_at) {
    this.id = id;
    this.name = name;
    this.is_deleted = is_deleted;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

// Class RoleDetail
export class RoleDetailModels {
  constructor(id, feature, can_view, can_create, can_update, can_delete, role) {
    this.id = id;
    this.feature = feature;
    this.can_view = can_view;
    this.can_create = can_create;
    this.can_update = can_update;
    this.can_delete = can_delete;
    this.role = role;
  }
}

// Class Role
export class RoleModel {
  constructor(id, role_details, name, is_deleted, created_at, updated_at) {
    this.id = id;
    this.role_details = role_details;
    this.name = name;
    this.is_deleted = is_deleted;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
