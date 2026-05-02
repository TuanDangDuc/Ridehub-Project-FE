import React from 'react';
import styles from './HowToUse.module.css';
import { LogIn, Search, Car, CreditCard, KeyRound, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Đăng ký thành viên Ridehub',
    desc: 'Để có thể đặt xe, bạn cần đăng ký tài khoản và đăng nhập vào hệ thống Ridehub. Bạn có thể sử dụng số điện thoại cá nhân hoặc thông qua các nền tảng bên thứ 3 như Facebook, Google... tuy nhiên bạn bắt buộc phải xác thực số điện thoại trước khi đặt xe.',
    icon: <LogIn size={42} strokeWidth={1.5} />
  },
  {
    id: 2,
    title: 'Tìm xe',
    desc: 'Chọn loại dịch vụ thuê xe, tuỳ chỉnh thời gian và địa điểm theo nhu cầu lộ trình. Bạn có thể sử dụng thêm bộ lọc trong trường hợp có nhu cầu cụ thể về dòng xe, truyền động, giá thành ... Ngoài ra bạn nên lưu ý thêm về các thông tin quan trọng khi thuê xe như Giấy tờ thuê xe, Phụ phí cũng như những chính sách riêng mà chủ xe quy định trong điều khoản thuê xe.',
    icon: <Search size={42} strokeWidth={1.5} />
  },
  {
    id: 3,
    title: 'Đặt xe',
    desc: 'Sau khi tìm được xe phù hợp với nhu cầu, khách thuê cần kiểm tra lại chính xác thông tin về thời gian, lộ trình cũng như giấy tờ thuê xe, sau cùng gửi yêu cầu thuê xe đến chủ xe. Khách thuê sẽ phải chờ chủ xe đồng ý yêu cầu thuê xe sau đó tiếp tục bước thanh toán để giữ chỗ chiếc xe cho chuyến đi sắp tới. Gợi ý cho bạn: Sử dụng bộ lọc để tìm các xe có hỗ trợ đặt xe nhanh, khi đặt những xe này bạn sẽ có thể thanh toán giữ chỗ ngay do chủ xe luôn mặc định đồng ý yêu cầu thuê xe của bạn.',
    icon: <Car size={42} strokeWidth={1.5} />
  },
  {
    id: 4,
    title: 'Thanh toán giữ chỗ',
    desc: 'Sau khi đã đảm bảo đúng thông tin, khách thuê sẽ tiến hành thanh toán để giữ chỗ. Hiện tại Ridehub áp dụng chính sách thanh toán 100% giá trị chuyến đi qua ứng dụng để giữ chỗ. Ridehub hỗ trợ hình thức thanh toán chuyển khoản',
    icon: <CreditCard size={42} strokeWidth={1.5} />
  },
  {
    id: 5,
    title: 'Nhận xe',
    desc: 'Khách thuê nhận xe tại địa chỉ xe hoặc tại địa điểm giao nhận cụ thể mà khách thuê đã chọn trên ứng dụng. Khách thuê kiểm tra tình trạng xe thực tế và giấy tờ xe, xuất trình bản gốc các giấy tờ thuê xe, kí xác nhận biên bản giao xe, nhận chìa khóa và bắt đầu hành trình.',
    icon: <KeyRound size={42} strokeWidth={1.5} />
  },
  {
    id: 6,
    title: 'Trả xe',
    desc: 'Sau khi hết thời gian thuê, bạn hoàn trả xe giống như tình trạng và thỏa thuận ban đầu. Kí xác nhận biên bản bàn giao, nhận lại giấy tờ để hoàn thành chuyến đi tuyệt vời của bạn. Đừng quên cho điểm rating và nhận xét của bạn đến chủ xe để nâng cao chất lượng phục vụ cho những hành trình sắp tới nhé!',
    icon: <CheckCircle2 size={42} strokeWidth={1.5} />
  }
];

const HowToUse: React.FC = () => {
  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>Quy trình thuê xe</h1>

      <div className={styles.grid}>
        {steps.map((step) => (
          <div key={step.id} className={styles.card}>
            <div className={styles.cardNumberBadge}>
              <span className={styles.cardNumberText}>{step.id}.</span>
            </div>

            <div className={styles.iconWrapper}>
              {step.icon}
            </div>

            <h3 className={styles.cardTitle}>{step.title}</h3>
            <p className={styles.cardDesc}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToUse;
