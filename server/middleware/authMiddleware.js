import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

const protectCompany = async (req, res, next) => {
    const token=req.headers.token;
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }   

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const company = await Company.findById(decoded.id);
        if (!company) {
            return res.status(401).json({ message: "Company not found" });
        }

        // Remove password from company object (DynamoDB doesn't have .select())
        req.company = {
            _id: company._id || company.companyId,
            companyId: company.companyId || company._id,
            name: company.name,
            email: company.email,
            image: company.image,
        };

        next();

    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: "Token is not valid" });
    }   
    
};
export default protectCompany;