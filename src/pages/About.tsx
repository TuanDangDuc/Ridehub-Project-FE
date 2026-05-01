import React from 'react';
import styles from './About.module.css';

const About: React.FC = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={`container ${styles.aboutContainer}`}>

        {/* Top Section */}
        <section className={styles.introSection}>
          <div className={styles.introLeft}>
            <h1 className={styles.introTitle}>
              Ridehub - Cùng bạn đến mọi hành trình
            </h1>
          </div>
          <div className={styles.introRight}>
            <p>
              Mỗi chuyến đi là một hành trình khám phá cuộc sống và thế giới xung quanh, là cơ hội học hỏi và chinh phục những điều mới lạ của mỗi cá nhân để trở nên tốt hơn. Do đó, chất lượng trải nghiệm của khách hàng là ưu tiên hàng đầu và là nguồn cảm hứng của đội ngũ Ridehub.
            </p>
            <p>
              Ridehub là nền tảng chia sẻ phương tiện, sứ mệnh của chúng tôi không chỉ dừng lại ở việc kết nối công ty và khách hàng một cách nhanh chóng - an toàn - tiện lợi, mà còn hướng đến việc truyền cảm hứng khám phá những điều mới lạ đến cộng đồng qua những chuyến đi trên nền tảng của chúng tôi.
            </p>
          </div>
        </section>

        {/* First Image Grid */}
        <section className={styles.imagesGrid}>
          <div className={styles.imgLeftWrapper}>
            <img
              src="/images/about/explore_driving.png"
              alt="Person exploring with map in car"
              className={styles.imgLeft}
            />
          </div>
          <div className={styles.imgRightWrapper}>
            <img
              src="/images/about/inspire_landscape.png"
              alt="Car driving on road"
              className={styles.imgRight}
            />
          </div>
        </section>

        {/* Bottom Section */}
        <section className={styles.visionSection}>
          <div className={styles.visionLeft}>
            <h2 className={styles.visionTitle}>Drive. Explore. Inspire</h2>
            <h3 className={styles.visionSubtitle}>Cầm lái và Khám phá thế giới đầy Cảm hứng.</h3>

            <p className={styles.visionText}>
              Ridehub đặt mục tiêu trở thành cộng đồng mạng dùng phương tiện di chuyển văn minh & uy tín tại Việt Nam, nhằm mang lại những giá trị thiết thực cho tất cả những thành viên hướng đến một cuộc sống tốt đẹp hơn.
            </p>
            <p className={styles.visionText}>
              Chúng tôi tin rằng mỗi hành trình đều quan trọng, vì vậy đội ngũ và các đối tác của Ridehub với nhiều kinh nghiệm về lĩnh vực cho thuê xe, công nghệ, bảo hiểm & du lịch sẽ mang đến cho hành trình của bạn thêm nhiều trải nghiệm thú vị cùng sự an toàn ở mức cao nhất.
            </p>
          </div>
          <div className={styles.visionRight}>
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Scenic landscape from car window"
              className={styles.visionImg}
            />
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
