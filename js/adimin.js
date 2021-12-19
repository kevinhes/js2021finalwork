// 預設動畫
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if(menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    }else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}
// 動元素

const orderList = document.querySelector('.orderPage-table tbody')


// 初始化

let orderData = []
const config = {
    headers:{
        "Authorization": token
    }
}

function init() {
    getOrderList()
}

init()

// 訂單資料取得 渲染

function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, config)
        .then(res => {
            orderData = res.data.orders
            console.log(orderData);
            let str = ""
            orderData.forEach(i => {
                // 訂單裝態字串
                let orderStatus = ""
                if(i.paid == true){
                    orderStatus = "已處理"
                }else if(i.paid == false){
                    orderStatus = "未處理"
                }
                // 產品品項字串
                let productItemList = ""
                i.products.forEach(i=> {
                    productItemList += `<p>${i.title}x${i.quantity}</p>`
                })
                // 畫面渲染
                str +=`
                <tr>
                    <td>${i.id}</td>
                    <td>
                    <p>${i.user.name}</p>
                    <p>${i.user.tel}</p>
                    </td>
                    <td>${i.user.address}</td>
                    <td>${i.user.email}</td>
                    <td>
                    <p>${productItemList}</p>
                    </td>
                    <td>2021/03/08</td>
                    <td>
                    <a href="#" class="orderStatus" data-id="${i.id}">${orderStatus}</a>
                    </td>
                    <td>
                    <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${i.id}">
                    </td>
                </tr>
                `
            })
            orderList.innerHTML = str
            renderC3()
        })
        .catch(error => {
            console.log(error);
        })
}

// 訂單狀態修改

orderList.addEventListener('click', e => {
    e.preventDefault()
    let id = e.target.dataset.id
    if(e.target.getAttribute('class') == "orderStatus"){
        let newStatus
        if(e.target.innerText == "未處理"){
            newStatus = true
        }else {
            newStatus = false
        }
        let obj = {
            "data": {
                "id": id,
                "paid": newStatus
            }
        }
        axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        obj,
        config)
        .then(res => {
            getOrderList()
        })
        .catch(error => {
            console.log(error);
        })
    }else if (e.target.getAttribute('class') == "delSingleOrder-Btn"){
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,config)
        .then(res => {
            getOrderList()
            renderC3()
        })
        .catch(error => {
            console.log(error);
        })
    }
})

// 刪除所有訂單

const discardAllBtn = document.querySelector('.discardAllBtn')
discardAllBtn.addEventListener('click',e=> {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, config)
        .then(res => {
            getOrderList()
            renderC3()
        })
        .catch(error => {
            console.log(error);
        })
})

// C3.js
function renderC3() {
    let c3Arr = []
    let productPirceTotal = {}
    let productTitle = []
    orderData.forEach(i => {
        i.products.forEach(item => {
            if(productPirceTotal[item.title] == undefined){
                productPirceTotal[item.title] = item.price*item.quantity
            } else {
                productPirceTotal[item.title] += item.price*item.quantity
            }
        })
    })
    productTitle = Object.keys(productPirceTotal)
    productTitle.forEach( i => {
        let arr = []
        arr.push(i)
        arr.push(productPirceTotal[i])
        c3Arr.push(arr)
    })
    c3Arr.sort((a,b) => {
        return b[1]-a[1]
    })
    let otherPrice = ['其他']
    let price = 0
    c3Arr.forEach((i,index) => {
        if(c3Arr.length > 3){
            if(index>2){
                console.log(i);
                price += i[1]
            }
        }
    })
    otherPrice.push(price)
    c3Arr.splice(3,c3Arr.length)
    c3Arr.push(otherPrice)
    console.log(otherPrice);
    console.log(c3Arr);
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: c3Arr,
        },
    });
}