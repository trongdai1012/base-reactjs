export const getMessageKey = (package_id, license_key) => {
    let packageName = '';
    if (package_id == 1) {
        packageName = 'VIP 1 THÁNG';
    } else if (package_id == 2) {
        packageName = 'VIP 3 THÁNG';
    } else if (package_id == 3) {
        packageName = 'VIP 1 NĂM';
    } else if (package_id == 4) {
        packageName = 'VIP TRỌN ĐỜI';
    }

    return `Chào Quý khách, \nCảm ơn Quý khách đã đặt mua tài khoản ${packageName} của ứng dụng KickEnglish – Học tiếng anh với ngôn ngữ NLP.\nĐây là MÃ KEY đặt hàng của Quý khách: ${license_key}\nĐể Kích hoạt mã sử dụng, Quý khách vui lòng theo hướng dẫn sau:\nBước 1: Tải App KickEnglish trên kho ứng dụng Android hoặc iOS\nBước 2: Đăng ký thành viên của KickEnglish APP\nBước 3: Truy cập vào đường link sau để Kích hoạt: https://kickenglish.net/redeem (Yêu cầu đăng nhập thông tin thành viên trên APP)\nBước 4: Mở APP và đăng nhập lại. Sẵn sàng sử dụng theo thời hạn đặt mua.\n\nVì sự thành công của bạn,\nKickEnglish Team`
}