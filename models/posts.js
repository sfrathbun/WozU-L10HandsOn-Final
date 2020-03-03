'use strict';
module.exports = function(sequelize, DataTypes) {
  const posts = sequelize.define('posts', {
    PostId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    PostTitle: DataTypes.STRING,
    PostBody: DataTypes.STRING,

    UserId: {
      type: DataTypes.INTEGER,
      model: "users",
      key: "UserId",
      allowNull: false
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {});
  posts.associate = function(models) {
    // associations can be defined here

    // models.posts.hasMany(models.users, {
    //   foreignKey: 'UserId' });
    
  };
  return posts;
};
