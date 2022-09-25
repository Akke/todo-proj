function displayModal(className) {
    let overlay = document.getElementsByClassName("modalOverlay")
    if(!overlay) return end

    overlay = overlay[0]

    overlay.style.visibility = "visible"
    overlay.style.opacity = "1"

    let modal = document.getElementsByClassName(className)
    if(!modal) return end

    modal = modal[0]

    modal.style.visibility = "visible"
    modal.style.opacity = "1"
}

function closeModal(className) {
    let overlay = document.getElementsByClassName("modalOverlay")
    if(!overlay) return end

    overlay = overlay[0]

    overlay.style.visibility = "collapse"
    overlay.style.opacity = "0"

    let modal = document.getElementsByClassName(className)
    if(!modal) return end

    modal = modal[0]

    modal.style.visibility = "collapse"
    modal.style.opacity = "0"
}