// ==UserScript==
// @name         pkmncf
// @namespace    https://pokemon-cafe.jp
// @version      0.2
// @description  for cafe enjoyers
// @author       Me
// @match        https://reserve.pokemon-cafe.jp
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokemon-cafe.jp
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    const NUMBER_OF_GUESTS = 2
    const BOOKING_MONTH = 11
    const BOOKING_DATE = 8
    const BOOKING_TIMES = ["14:35", "14:50"] //acceptable booking times
    const TABLE_TYPES = ["A", "B"] //acceptable table types (A/B/C are table (2-8 ppl), D is counter (2 ppl)

    if (window.location.href.endsWith(".jp/")) {
        document.querySelector(`[href="/reserve/agree"]`).click()
    }

    if (window.location.href.indexOf("reserve/agree") > 0) {
        document.querySelector(`input#agreeChecked`).click()
        document.querySelector(`input[type="submit"]`).click()
    }

    if (window.location.href.indexOf("auth_confirm") > 0) {
        document.querySelector(`[href="/reserve/step1"]`).click()
    }

    if (window.location.href.indexOf("reserve/step1") > 0 && !(document.querySelector(`form#step2-form`))) {
        let form = document.querySelector(`form[action="/reserve/step1"]`)
        form.querySelector(`select`).value = NUMBER_OF_GUESTS
        form.submit()
    }

    if (document.querySelector(`form#step2-form`)) {
        const dateSelector = `#step2-form > div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > h3:nth-child(2)`
        let month = Number.parseInt(document.querySelector(dateSelector).textContent.match(/年([\d]+)/)[1])
        while (month < BOOKING_MONTH) {
            document.querySelectorAll(".calendar-pager")[1].click()
            month = Number.parseInt(document.querySelector(dateSelector).textContent.match(/年([\d]+)/)[1])
        }
        document.evaluate(`//*/form[@id="step2-form"]//div[text() = ${BOOKING_DATE}]`, document.body).iterateNext().click()
        document.querySelector(`form#step2-form input#submit_button`).click()
    }

    if (window.location.href.indexOf("reserve/step2") > 0) {
        const seatSelector = `div[contains(@class, "seattypetext") and (${TABLE_TYPES.map(t => `text()="`+t+`席"`).join(" or ")})]`
        const timeSelector = `div[contains(@class, "timetext") and (${BOOKING_TIMES.map(t => `text()="`+t+`~"`).join(" or ")})]`
        const statusSelector = `div[contains(@class, "status-box") and (div[text()="Full"])]`
        const selector = [seatSelector, timeSelector, statusSelector].join(" and ")

        let seats = document.evaluate(`//*/div[${selector}]`, document.body)
        seats.iterateNext().click() //Always try first slot, if it fails it'll be full after refresh

        //assuming navigation happens here, if no navigation after 2s refresh
        setTimeout(_ => {window.location.href = window.location.href}, 5000)
    }
})();