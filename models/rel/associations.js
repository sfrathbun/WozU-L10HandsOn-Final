// this defines the association between our users and posts

module.exports = function(models) {
    models.users.hasMany(models.posts, {
        foreignKey: 'UserId' 
    });
    
        models.posts.belongsTo(models.users, {
            through: models.users,
        foreignKey: 'UserId' 
    });
}



// module.exports = function(models) {
//     models.users.hasMany(models.posts, 
//         { foreignKey: 'UserId' });
    
//         models.posts.belongsTo(models.users, {
//         through: models.users});
// }