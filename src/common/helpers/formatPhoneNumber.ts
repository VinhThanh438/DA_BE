export const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '')
  
    // Chia chuỗi số thành từng nhóm 3 chữ số từ phải sang trái
    const reversed = digits.split('').reverse()
    const grouped: string[] = []
  
    for (let i = 0; i < reversed.length; i += 3) {
      grouped.push(reversed.slice(i, i + 3).reverse().join(''))
    }
  
    return grouped.reverse().join('.')
  }
  