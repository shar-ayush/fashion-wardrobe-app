import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    gender: String,
    outfits:[{ type: mongoose.Schema.Types.ObjectId, ref: 'SavedOutfit' }],
});

userSchema.pre("save", async function (next){
    if(this.isModified("password")){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
})

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password);
}

export default mongoose.model("User", userSchema);