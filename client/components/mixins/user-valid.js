export default {
  methods: {
    /**
     * 密码长度必须大于指定长度
     * @param {*} value
     * @param {number} len 指定长度
     * @return {Boolean}
     */
    checkPasswordLength(value, len = 12) {
      return value && value.length >= len;
    },
    /**
     * 检查密码复杂度
     * 必须至少包含一个数字、一个大写字母、一个小写字母和特殊字符
     * @param {*} value
     * @return {Boolean}
     */
    checkPasswordComplex(value) {
      return (
        /[0-9]{1,}/g.test(value) &&
        /[a-z]{1,}/g.test(value) &&
        /[A-Z]{1,}/g.test(value) &&
        /[^a-zA-Z0-9]{1,}/g.test(value)
      );
    },
    /**
     * 检查密码复杂度 (不需要特殊字符)
     * 必须至少包含一个数字、一个大写字母和一个小写字母
     * @param {*} value
     * @return {Boolean}
     */
    checkPasswordComplexSimpler(value) {
      return (
        /[0-9]{1,}/g.test(value) &&
        /[a-z]{1,}/g.test(value) &&
        /[A-Z]{1,}/g.test(value)
      );
    },
    /**
     * 检查密码是否在合法字符范围内
     * @param {*} value
     * @return {Boolean}
     */
    checkPasswordInvalid(value) {
      return /^[ -~]+$/g.test(value);
    }
  }
};
