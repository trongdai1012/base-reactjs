export const formatMoney = (m) => {
    if (!m) return '0';
    m = parseFloat(m);
    return m.toLocaleString();
}