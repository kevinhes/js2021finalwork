document.addEventListener('DOMContentLoaded', function() {
    const ele = document.querySelector('.recommendation-wall');
    ele.style.cursor = 'grab';
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    const mouseDownHandler = function(e) {
        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';

        pos = {
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };
    const mouseMoveHandler = function(e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        ele.scrollTop = pos.top - dy;
        ele.scrollLeft = pos.left - dx;
    };
    const mouseUpHandler = function() {
        ele.style.cursor = 'grab';
        ele.style.removeProperty('user-select');

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };
    // Attach the handler
    ele.addEventListener('mousedown', mouseDownHandler);
});
// menu 切換
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

const productList = document.querySelector('.productWrap')
const productSelect = document.querySelector('.productSelect')
const shoppingCartList = document.querySelector('.shoppingCart-table tbody')
const discardAllBtn = document.querySelector('.discardAllBtn')
const orderInfoBtn = document.querySelector('.orderInfo-btn')

// 初始化

let productData = []
let shoppingCartData = []

function init() {
    getDataAndRender()
    getShoppingCartList()
}

init()

// 接資料

function getDataAndRender() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then(res => {
            productData = res.data.products
            render()
        })
        .catch(error => {
            console.log(error);
        })
}

// 畫面渲染

function render(category = "全部") {
    let str = ""
    let cacheData = productData
    cacheData = cacheData.filter(i => {
        if(category == i.category){
            return i
        }else if( category == "全部"){
            return i
        }
    })
    cacheData.forEach(i => {
        str +=`
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${i.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${i.id}">加入購物車</a>
            <h3>${i.title}</h3>
            <del class="originPrice">NT$${numberWithCommas(i.origin_price)}</del>
            <p class="nowPrice">NT$${numberWithCommas(i.price)}</p>
        </li>
        `
    })
    productList.innerHTML = str
}

// 家具種類切換

productSelect.addEventListener('change', e=> {
    render(e.target.value)
})

// 接購物車資料 渲染購物車

function getShoppingCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(res=> {
        shoppingCartData = res.data.carts
        document.querySelector('.finalTotal').textContent = numberWithCommas(res.data.finalTotal)
        let str = ""
        shoppingCartData.forEach(i => {
            str += `
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${i.product.images}" alt="">
                        <p>${i.product.title}</p>
                    </div>
                </td>
                <td>NT$${numberWithCommas(i.product.origin_price)}</td>
                <td><input type="number" value="${i.quantity}" data-id="${i.id}" class="itemNum"></td>
                <td>NT$${numberWithCommas(i.product.price)}</td>
                <td class="discardBtn">
                    <a href="#" class="delItem material-icons" data-id="${i.id}">
                        clear
                    </a>
                </td>
            </tr>
            `
        })
        shoppingCartList.innerHTML = str
        const itemNum = document.querySelectorAll('.itemNum')
        itemNum.forEach( i => {
            i.addEventListener("change", changeNum)
        })
    })
}

// 新增至購物車 修改購物車數量

productList.addEventListener('click', e=>{
    e.preventDefault()
    let id = e.target.dataset.id
    let shoppingItemNum = 1
    shoppingCartData.forEach( i => {
        if(i.product.id == id){
            shoppingItemNum = i.quantity +=1
        }
    })
    if(e.target.getAttribute('class') == "addCardBtn"){
        let obj = {
            "data":{
                "productId": id,
                "quantity": shoppingItemNum
            }
        }
        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/kevinhesapi/carts`, obj)
            .then(res => {
                getShoppingCartList()
            })
            .catch(error => {
                console.log(error);
            })
    }
})

// 修改購物車數量

function changeNum(e) {
    let id = e.target.dataset.id
    let num = parseInt(e.target.value)
    let obj = {
        "data": {
            "id": id,
            "quantity": num
          }
    }
    axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, obj)
        .then(res => {
            getShoppingCartList()
        })
        .catch(error => {
            console.log(error);
        })
}

// 刪除購物車數量

shoppingCartList.addEventListener('click', e=>{
    e.preventDefault()
    let id = e.target.dataset.id
    if(e.target.getAttribute('class') == "delItem material-icons"){
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`)
            .then(res => {
                getShoppingCartList()
            })
            .catch(error => {
                console.log(error);
            })
    }
})

// 刪除全部品項

discardAllBtn.addEventListener('click', e=> {
    e.preventDefault()
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(res => {
        getShoppingCartList()
    })
    .catch(error => {
        console.log(error);
    })
})

// 訂單送出

orderInfoBtn.addEventListener('click', e=> {
    const customerName = document.querySelector('#customerName').value
    const customerPhone = document.querySelector('#customerPhone').value
    const customerEmail = document.querySelector('#customerEmail').value
    const customerAddress = document.querySelector('#customerAddress').value
    const customertradeWay = document.querySelector('#tradeWay').value
    const orderInfoForm = document.querySelector('.orderInfo-form')
    let obj = {
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customertradeWay
            }
          }
    }
    if(customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customertradeWay == ""){
        alert('請輸入正確資訊')
        return
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, obj)
        .then(res => {
            alert('訂單建立成功')
            getShoppingCartList()
            orderInfoForm.reset()
        })
})

// 千分位

function numberWithCommas(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join("."); 
}