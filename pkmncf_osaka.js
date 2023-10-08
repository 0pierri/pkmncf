// ==UserScript==
// @name         pkmncf_osaka
// @namespace    https://pokemon-cafe.jp
// @version      0.1
// @description  for Osaka cafe enjoyers
// @author       Me
// @match        https://osaka.pokemon-cafe.jp
// @match        https://osaka.pokemon-cafe.jp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokemon-cafe.jp
// ==/UserScript==

(function() {
    'use strict';
    const NUMBER_OF_GUESTS = 0
    const BOOKING_TIMES = ["14:05", "14:20"] // Any of:  10:10, 10:25, 10:40, 12:00, 12:15, 12:30, 13:50, 14:05, 14:20, 15:40, 15:55, 16:10, 17:30, 17:45, 18:00, 19:20, 19:35, 19:50
    const TABLE_TYPES = ["A", "B"] // A,B are table seats (2-8 ppl), C is counter seat (2 ppl)

    // Date defaults to current date, next month
    const BOOKING_MONTH = Number.parseInt(new Date().getMonth() + 2)
    const BOOKING_DATE = Number.parseInt(new Date().getDate())

    if (NUMBER_OF_GUESTS == 0) {
        alert("Update settings before using this script (Dashboard > pkmncf > Edit lines 15-19")
        return
    }

    if (window.location.href.endsWith(".jp/")) {
        document.querySelector(`[href="/reserve/agree"]`).click()
    }

    if (window.location.href.indexOf("reserve/agree") > 0) {
        let timeout = 0;
        if (document.querySelector(`p.alert`)) {
            timeout = 5000;
        }
        setTimeout(_ => {
            document.querySelector(`input#agreeChecked`).click()
            document.querySelector(`input[type="submit"]`).click()
        }, timeout)
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
        const statusSelector = `div[contains(@class, "status-box") and not(div[text()="Full"])]`
        const selector = [seatSelector, timeSelector, statusSelector].join(" and ")

        let seats = document.evaluate(`//*/div[${selector}]`, document.body)
        seats.iterateNext().click() //Always try first slot, if it fails it'll be full after refresh

        //assuming navigation happens here, if no navigation after 2s refresh
        setTimeout(_ => {window.location.href = "/reserve/agree"}, 5000)
    }
})();