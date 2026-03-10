document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        search: "",
        selectedIndex: -1,

        items: [
            {
                id: 1,
                name: 'Robusta Brazil',
                img: '1.jpg',
                price: 25000,
                rating: 4,
                description: 'Kopi robusta dengan aroma kuat dan rasa pahit yang khas dari Amerika.'
            },
            {
                id: 2,
                name: 'Arabica Blend',
                img: '2.jpg',
                price: 35000,
                rating: 4,
                description: 'Kopi robusta dengan aroma kuat dan rasa pahit yang khas dari Amerika.'
            },
            {
                id: 3,
                name: 'Arabica Blend',
                img: '3.jpg',
                price: 21000,
                rating: 4,
                description: 'Kopi robusta dengan aroma kuat dan rasa pahit yang khas dari Amerika.'
            },
            {
                id: 4,
                name: 'Arabica Blend',
                img: '4.jpg',
                price: 27000,
                rating: 4,
                description: 'Kopi robusta dengan aroma kuat dan rasa pahit yang khas dari Amerika.'
            },
            {
                id: 5,
                name: 'Biji Kopi Aceh',
                img: '5.jpg',
                price: 20000,
                rating: 4,
                description: 'Kopi robusta dengan aroma kuat dan rasa pahit yang khas dari Amerika.'
            },
        ],

        showModal: false,
        selectedItem: null,

        openModal(item) {
            this.selectedItem = item
            this.showModal = true
        },

        closeModal() {
            this.showModal = false
            this.selectedItem = null

        },

        get filteredItems() {
            if (this.search === "") return this.items

            return this.items.filter(item =>
                item.name.toLowerCase().includes(this.search.toLowerCase())
            )
        },

        highlight(text) {
            if (!this.search) return text;

            const regex = new RegExp(`(${this.search})`, "gi");

            return text.replace(
                regex,
                `<span class="search-highlight">$1</span>`
            );
        },
        /* AUTOCOMPLETE SUGGESTION */
        get suggestions() {

            if (!this.search) return []

            return this.items
                .filter(item =>
                    item.name.toLowerCase().includes(this.search.toLowerCase())
                )
                .slice(0, 5)

        },

        /* PILIH SUGGESTION */
        selectSuggestion(item) {

            this.search = ""
            this.selectedIndex = -1

            this.scrollToProduct(item.id)

        },

        navigateDown() {

            if (this.selectedIndex < this.suggestions.length - 1) {
                this.selectedIndex++
            }

            this.$nextTick(() => {
                const el = document.querySelector(".active-suggestion")
                if (el) el.scrollIntoView({ block: "nearest" })
            })

        },

        navigateUp() {

            if (this.selectedIndex > 0) {
                this.selectedIndex--
            }

            this.$nextTick(() => {
                const el = document.querySelector(".active-suggestion")
                if (el) el.scrollIntoView({ block: "nearest" })
            })

        },

        enterSelection() {

            if (this.selectedIndex >= 0) {

                this.selectSuggestion(this.suggestions[this.selectedIndex])

            } else {

                const item = this.suggestions[0]

                if (item) this.selectSuggestion(item)

            }

        },

        scrollToProduct(id) {

            this.$nextTick(() => {

                const el = document.getElementById("product-" + id)

                if (el) {

                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    })

                }

            })

        },

        init() {
            this.$nextTick(() => {
                feather.replace();
            });
        }
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        success: false,
        add(newItem) {
            // reset pesan sukses jika user belanja lagi
            this.success = false;

            // cek apakah ada barang yang sama
            const cartItem = this.items.find((item) => item.id === newItem.id);

            if (!cartItem) {
                this.items.push({ ...newItem, quantity: 1, total: newItem.price });
                this.quantity++;
                this.total += newItem.price;

            } else {
                // jika barang sudah ada di cart, cek apakah barang berbeda atau sama dengan yang ada di cart
                this.items = this.items.map((item) => {
                    // jika barang berbeda
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        //jika barang sudah ada, tambah quantity dan totalnya
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }
        },
        remove(id) {
            // ambil item yang mau di remove berdasarkan id nya
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1
            if (cartItem.quantity > 1) {
                //telusuri satu2
                this.items = this.items.map((item) => {
                    // jika bukan barang yang di klik skip
                    if (item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                })
            } else if (cartItem.quantity === 1) {
                //jika barangnya sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }

            // RESET SUCCESS JIKA CART KOSONG
            if (this.items.length === 0) {
                this.success = false;
            }
        },
    });
});

// Form validation
const checkoutButton = document.querySelector('.checkout-button');
const form = document.querySelector('#checkoutForm');

checkoutButton.disabled = true;

form.addEventListener('input', function () {

    let valid = true;

    for (let i = 0; i < form.elements.length; i++) {

        const el = form.elements[i];

        if (el.type !== "hidden" && el.value.trim() === "") {
            valid = false;
            break;
        }

    }

    checkoutButton.disabled = !valid;

    if (valid) {
        checkoutButton.classList.remove("disabled");
    } else {
        checkoutButton.classList.add("disabled");
    }

});


// kirim data ketika tombol checkout di klik
checkoutButton.addEventListener('click', function (e) {
    // jika tombol disabled jangan lanjut
    if (checkoutButton.disabled) {
        e.preventDefault();
        return;
    }

    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    const message = formatMessage(objData);
    window.open('https://wa.me/6285794799902?text=' + encodeURIComponent(message));

    // reset cart
    Alpine.store("cart").items = [];
    Alpine.store("cart").total = 0;
    Alpine.store("cart").quantity = 0;
    // tampilkan pesan sukses
    Alpine.store("cart").success = true;
});

// format pesan whatsapp
const formatMessage = (obj) => {

    const items = JSON.parse(obj.items)
        .map((item, index) => {
            return `${index + 1}. ${item.name}
   ${item.quantity} x ${rupiah(item.total)}`;
        })
        .join("\n\n");

    return `DATA CUSTOMER

Nama: ${obj.name}
Email: ${obj.email}
No HP: ${obj.phone}

DATA PESANAN

${items}

TOTAL PEMBAYARAN
${rupiah(obj.total)}

Terima Kasih`;
};

const contactForm = document.querySelector(".contact form");
const toast = document.getElementById("toast-message");

contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // tampilkan toast
    toast.classList.add("show");

    // hilangkan setelah 3 detik
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

    // reset form
    contactForm.reset();
});

// konversi ke rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};