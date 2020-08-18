module.exports = {
    formatTime: (time) => {
        if (!time) return '';
        let d = new Date(time);
        let curr_date = d.getDate();
        let curr_month = d.getMonth() + 1;
        let curr_year = d.getFullYear();
        let curr_hours = d.getHours();
        let curr_minus = d.getMinutes();
        let curr_second = d.getSeconds();
        curr_second = curr_second < 10 ? '0' + curr_second : curr_second;
        curr_minus = curr_minus < 10 ? '0' + curr_minus : curr_minus;
        curr_hours = curr_hours < 10 ? '0' + curr_hours : curr_hours;
        curr_date = curr_date < 10 ? '0' + curr_date : curr_date;
        curr_month = curr_month < 10 ? '0' + curr_month : curr_month;

        return (
            curr_hours +
            ':' +
            curr_minus +
            ':' +
            curr_second +
            ' ' +
            curr_date+
            '-' +
            curr_month +
            '-' +
            curr_year
        );
    }
}