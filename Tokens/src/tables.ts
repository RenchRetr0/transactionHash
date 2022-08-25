import Role from "./database/models/Role";
import sequelize from "./database/sequelize";


const tickets = async () => {
    await sequelize.sync({alter:true});
}
tickets().then().catch(e => console.log(e))
