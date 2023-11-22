import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/appError.js";
import crypto from 'crypto'
export const getRazorpayApiKey = async (req, res, next) => {

try{
    res.status(200).json({
        success:true,
        message:"RaorPay Key",
        key:process.env.RAZORPAY_API_KEY
    })

}
catch(e)
{
    return next(new AppError(e.message,500))
}







};

export const buySubscription = async (req, res, next) => {

    try{
        const {id}=req.user;
        
        const user=await User.findById(id);

         
        if(!user)
        {
            return next(new AppError("User Not found",404))
        }
         
        if(user.role=='ADMIN')
        {
            return next (new AppError("Admin cant buy subscription",400))
        }

        const subscription= await razorpay.subscriptions.create({
            plan_id:process.env.RAZORPAY_PLAN,
            customer_notify:1 ,//sends mail to customer
            total_count:12 // charge for every 1 year
        })
        // console.log(subscription)
        // update userr with subscription
       
       
        user.subscription.id=subscription.id;
        user.subscription.status=subscription.status
       
        console.log()
        console.log(user.subscription.id)
           await user.save();
           res.status(200).json({
            subscription_id: subscription.id,
            success:true,
            message:" Subscribed Successfully"
           })
    }
    catch(e)
    { console.log(e)
        return next(new AppError(e.message,500))
       
    }
    











};

export const verifySubscription = async (req, res, next) => {

    try{
           const {id}=req.user;
           if(!id)
           {
               return next(new AppError("User id not found",404))
           }
           const user = await User.findById(id);
           if(!user)
           {
               return next(new AppError("User Not found",404))
           }
           const subscriptionId = user.subscription.id;

           const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body;
            
           const generatedSignature = crypto
           .createHmac('sha256', process.env.RAZORPAY_SECRET)
           .update(`${razorpay_payment_id}|${subscriptionId}`)
           .digest('hex');
             console.log(generatedSignature)
             console.log(razorpay_signature)

                                        if(generatedSignature!==razorpay_signature)
                                        {
                                            return next(new AppError("Payment Unsuccessfull",500))
                                        }
  // Record Payment Details in Database
    await Payment.create({
        payment_id:razorpay_payment_id,
        subscription_id:razorpay_subscription_id,
        signature:razorpay_signature
        
    })
  // update user model with successful payment
  user.subscription.status='active';
  await user.save();


  res.status(200).json({
    success:true,
    message:"Payment Verified"
  })



    

    } 
    catch(e)
    {
        console.log(e)
        return next(new AppError(e.message,400))
        
    }
    
};

export const cancelSubscription = async (req, res, next) => {
    try{
        const {id}=req.user;
        const user = await User.findById(id);
        if(!user)
        {
            return next(new AppError("User Not found",404))
        }

        if(user.role==='ADMIN')
    {
        return next(new AppError("Admin cant cancel subscription",500))
    }

    const subscriptionId=user.subscription.id;
      const subscription= await razorpay.subscriptions.cancel({
        subscriptionId
      });
      user.subscription.status=subscription.status;
      await user.save();
      res.status(200).json({
        success:true,
        message:"Subscription cancelled"
      })
    }
    catch(e)
    {
        return next(new AppError(e.message,500))
    }
    
    
};

export const getAllPayments = async (req, res, next) => {
    try{
        const {count}=req.query;
        const subscriptions=razorpay.subscriptions.all({
            count: count ||10,
        });

        res.status(200).json({
            success:true,
            message:'All Payments',
            payments:subscriptions
        })

    }
    catch(e)
    {
        return next(new AppError(e.message,500))
    }
    
};
