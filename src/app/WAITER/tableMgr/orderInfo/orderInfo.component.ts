import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../../SERVICE/local.storage';
import { ApiService } from '../../../SERVICE/api.service';
declare var layer: any;
@Component({
  selector: 'app-orderInfo',
  templateUrl: './orderInfo.component.html',
  styleUrls: ['./orderInfo.component.css']
})
export class OrderInfoComponent implements OnInit {

  dishMenu: any = [];
  sumPrice: number = 0.00;
  tableId = this.ls.get("tableid");
  UserOrderingParam = {
    Ask: this.ls.getObject("ask").Ask || "",
    PeoPleNum: this.ls.getObject("ask").PeoPleNum || "",
    Menus: [],
    ShopTableId: this.ls.get("tableidd"),
    OrderPeopleType: 1,
    OrderNum: ""
  };
  constructor(private api: ApiService,
    private routerInfo: ActivatedRoute,
    private router: Router,
    private ls: LocalStorage) { }
  ngOnInit() {
    this.UserOrderingParam.OrderNum = this.routerInfo.snapshot.params["orderid"];
    this.dishMenu = this.ls.getObject("ls_dish");
    this.sumPrice = this.ls.getObject("ls_sumPrice");
  }
  rightClick(item) {
    this.ls.setObject("ask", {
      Ask: this.UserOrderingParam.Ask,
      PeoPleNum: this.UserOrderingParam.PeoPleNum
    });
    this.router.navigateByUrl("/components/taboos");
  }
  checkDishList(list: [any]) {
    for (var key in list) {
      if (list.hasOwnProperty(key)) {
        var element = list[key];
        if (element.Num > 0) {
          return false;
        }
      }
    }
    return true;
  }
  getTaboos(checkName) {
    if(checkName){
      return checkName.join(',');
    }else{
      return "";
    }
  }
  submit() {
    this.UserOrderingParam.Menus = [];
    for (var key in this.dishMenu) {
      if (this.dishMenu.hasOwnProperty(key)) {
        var dishList = this.dishMenu[key];
        dishList.List.forEach(element => {
          if (element.Num > 0) {
            var index = this.UserOrderingParam.Menus.findIndex(menuItem => menuItem.Id == element.Id);
            if (index == -1) {
              this.UserOrderingParam.Menus.push({
                Id: element.Id,
                Name: element.Name,
                Num: element.Num,
                Taboos: this.getTaboos(element.checkName)
              });
            }
          }
        });
      }
    }
    // 当orderId不为空时  ，需执行加菜功能
    if (this.UserOrderingParam.OrderNum) {
      this.api.Post(this.UserOrderingParam, "UserAddToOrdering").subscribe((res) => {
        if (res.State == 0) {
          layer.msg("下单成功！");
          this.router.navigateByUrl(`tableMgr/orderCheck/${res.Value}`);
        }
      });
    } else {
      this.api.Post(this.UserOrderingParam, "UserOrdering").subscribe((res) => {
        if (res.State == 0) {
          layer.msg("下单成功！");
          this.router.navigateByUrl(`tableMgr/orderCheck/${res.Value}`);
        }
      });
    }

  }
}
