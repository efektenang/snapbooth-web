import { NextResponse } from "next/server";
import midtrans from "midtrans-client";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { amount, customerDetails } = await req.json();
    
    // @ts-ignore
    const snap = new midtrans.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR_KEY",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-YOUR_KEY",
    });

    const orderId = `SNAP-${nanoid(10)}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount || 50000,
      },
      credit_card: {
        secure: true,
      },
      customer_details: customerDetails,
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId: orderId,
    });
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
