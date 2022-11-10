import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { send } from "../email";
import { Coupon, Order, User } from "../db";
class OrderService {
  // 본 파일의 맨 아래에서, new orderService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor() {}
  async newOrder(data) {
    console.log("주문하기 서비스 진입");
    console.log("주문하기 서비스 진입1");
    const newOrder = await Order.create(data);

    console.log("1");
    await User.updateOne(
      { _id: data.buyer },
      { $push: { orders: newOrder._id } }
    );
    console.log("2");
    const sumUser = await User.findById({ _id: data.buyer });
    const SumTotalPrice =
      Number(sumUser.totalPayAmount) + Number(newOrder.totalPrice);
    await User.updateOne(
      { _id: sumUser.id },
      { totalPayAmount: SumTotalPrice }
    );
    console.log("3");
    // 사용한 쿠폰 삭제
    console.log(data.couponId);
    if (data.couponId === undefined || data.couponId === "none") {
      console.log("컨틴뉴~");
    } else {
      console.log("이건 실행이 되면 안됌");
      //여기서 data.couponId는 쿠폰의 id값을 의미한다.
      const findcoupon = await Coupon.findOne({ id: data.couponId });
      const findUser = await User.findById(findcoupon.owner);
      console.log(
        "제발 내가 찾는게 맞아라 제발 부탁이야: " + findUser.ownCoupons
      );
      console.log(
        "제발 내가 찾는게 맞아라 제발 부탁이야 유저 맞제?: " + findUser.id
      );
      //유저의 ownCoupons와 해당 쿠폰 지우기
      if (findUser.ownCoupons) {
        await User.updateOne(
          { _id: findUser.id },
          { $unset: { ownCoupons: findUser.ownCoupons } }
        );
        await Coupon.deleteOne({ _id: data.couponId });
      }
    }
    console.log("이메일로보내기 직전");
    // 형석님 수고하셨네요 ㅋㅋ
    // 이메일 발송 추가합니당
    console.log("이메일로 보냄 : ", sumUser.email);
    const mailInfo = {
      from: "jinytree1403@naver.com",
      to: sumUser.email,
      subject: "[Hugging] 결제완료  ",
      text: `주문해주셔서 감사합니다.
          결제하신내역입니다.
          -------------------------
          요청사항 : ${newOrder.deliveryMsg}
          결제방법 : ${newOrder.payMethod}
          총 결제금액 : ${newOrder.totalPrice}
          총 ${newOrder.items.length}개 구매하셨습니다.

          감사합니다.
    `,
    };
    // send 는 config에 있는 것임.
    const sent = send(mailInfo);
    console.log(sent);
    return newOrder;
  }

  async getOrderList(data) {
    // await Order.deleteMany({});
    console.log("find orderList!  data :", data);
    // 토큰에 관리자가 있다면 data 에 관리자가 들어옴
    // await Order.deleteMany({});
    const isNull = await Order.find();
    if (isNull.length === 0) {
      throw new Error("주문내역이 없습니다.");
    }
    if (data === "admin") {
      const orders = await Order.find({}) // 현재까지 주문한 모든 목록
        .populate("items.id")
        .populate("buyer");
      let result = [];
      for (let i = 0; i < orders.length; i++) {
        let obj = {}; // json형태로 반환하려고 만든것
        let itemsArr = []; // 상품목록을 깔끔하게 넣으려고
        //
        for (let r = 0; r < orders[i].items.length; r++) {
          // i번째 주문의 items의 길이.
          itemsArr.push({
            상품: orders[i].items[r].id.name,
            개수: orders[i].items[r].count,
          });
        }
        console.log("obj 생성직전");
        if (!orders[i].buyer) {
          obj = {
            상품목록: itemsArr,
            주문번호: orders[i]._id,
            주문날짜: orders[i].createdAt,
            주문시간: orders[i].createdAt,
            배송상태: orders[i].deliveryStatus,
            구매자이름: "탈퇴한유저",
            구매자이메일: "탈퇴한유저",
            전화번호: "탈퇴한유저",
            주소: "탈퇴한유저",
            수정: orders[i].orderStatus,
            요청사항: orders[i].deliveryMsg,
          };
        } else {
          obj = {
            상품목록: itemsArr,
            주문번호: orders[i]._id,
            주문날짜: orders[i].createdAt,
            주문시간: orders[i].createdAt,
            배송상태: orders[i].deliveryStatus,
            구매자이름: orders[i].buyer.name,
            구매자이메일: orders[i].buyer.email,
            전화번호: orders[i].buyer.phoneNumber,
            주소: orders[i].buyer.address,
            수정: orders[i].orderStatus,
            요청사항: orders[i].deliveryMsg,
          };
        }
        result.push(obj);
        console.log(obj);
        console.log("obj 생성완료");
      }

      return result;
    }
    // 관리자가 아니라면 데이터에는 id가 들어오게 된다
    else {
      const orders = await Order.find({ buyer: data }) // 현재까지 주문한 모든 목록
        .populate("items.id")
        .populate("buyer");
      let result = [];
      for (let i = 0; i < orders.length; i++) {
        console.log("포문 돌아감");
        let obj = {}; // json형태로 반환하려고 만든것
        let itemsArr = []; // 상품목록을 깔끔하게 넣으려고
        //
        for (let r = 0; r < orders[i].items.length; r++) {
          console.log("2포문 돌아감");
          // i번째 주문의 items의 길이.
          itemsArr.push({
            상품: orders[i].items[r].id.name,
            개수: orders[i].items[r].count,
          });
        }
        obj = {
          대표이미지: orders[i].items[0].id.imageUrl,
          상품목록: itemsArr,
          주문번호: orders[i]._id,
          주문날짜: orders[i].createdAt,
          주문시간: orders[i].createdAt,
          배송상태: orders[i].deliveryStatus,
          구매자이름: orders[i].buyer.name,
          구매자이메일: orders[i].buyer.email,
          전화번호: orders[i].buyer.phoneNumber,
          주소: orders[i].buyer.address,
          수정: orders[i].orderStatus,
          요청사항: orders[i].deliveryMsg,
          총금액: orders[i].totalPrice,
        };
        result.push(obj);
      }
      console.log(result);
      return result;
    }
  }

  async orderCancel(data) {
    const { id, currentRole } = data;
    console.log("ORDER : 취소 서비스 들어옴");
    // 토큰 권한이 관리자일때 수정로직
    if (currentRole === "admin") {
      console.log("ORDER : 관리자 캔슬");
      // 요청받은 주문번호가 수정가능한 상태인지 체크
      const statusCheck = await Order.findById({ _id: id });
      if (statusCheck.orderStatus === "수정가능") {
        await Order.updateMany(
          { _id: id },
          {
            deliveryStatus: "관리자에 의한 주문취소",
            orderStatus: "수정불가",
          }
        );
        return;
      }
      // 토큰권한 사용자일 경우
    } else if (currentRole === "user") {
      console.log("ORDER : 사용자가 주문취소 버튼 누름");
      await Order.updateOne(
        { _id: id },
        {
          deliveryStatus: "고객주문취소",
          orderStatus: "수정불가",
        }
      );
      return;
    } else {
      throw new Error("ORDER: 로그인 사용자만 이용 가능한 서비스입니다.");
    }
  }
  // 수정 이유가 배송상태 변경일 경우 함수
  async orderSend(data) {
    const { id, reson } = data;
    // 배송상태변경
    await Order.updateMany({ _id: id }, { deliveryStatus: reson });
    // 만약 배송상태가 배송완료라면, 더이상 수정할수 없게 만듬.
    if (reson === "배송완료") {
      await Order.updateMany({ _id: id }, { orderStatus: "수정불가" });
      //
    }
    return;
  }

  async subTotalPayAmount(id) {
    const findOrderOwner = await Order.findById({ _id: id });
    const findUser = await User.findById({ _id: findOrderOwner.buyer });
    const subTotal = findUser.totalPayAmount - findOrderOwner.totalPrice;
    await User.updateOne({ _id: findUser.id }, { totalPayAmount: subTotal });
    return;
  }

  //   const sumUser = await User.findById({ _id: data.buyer });
  // const SumTotalPrice =
  //   Number(sumUser.totalPayAmount) + Number(newOrder.totalPrice);
  // await User.updateOne(
  //   { _id: sumUser.id },
  //   { totalPayAmount: SumTotalPrice }
  // );
}

const orderService = new OrderService();

export { orderService };
