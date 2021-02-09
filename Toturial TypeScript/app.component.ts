import { Component } from '@angular/core';

interface Display{
  name:string
  age:number

  displayInfo():any
}

class X{

  constructor(display:Display){
    display.displayInfo()
    console.log(display.name,display.age)
  }

}

class A implements Display{
  name='abdullah'
  age=25
  constructor(){
    new X (this)
  }
  displayInfo(){
    this.age=24
  }
}

class B implements Display{

  constructor(){
    new X (this)
  }
  name = 'osama';
  age = 25;

  displayInfo() {
 //fggg
  }


}

class C implements Display{ 
  name='ahmed'
  age=25
  constructor(){
    new X (this)
  }
  displayInfo(){
    //jkjk
  }
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tutorial_angular';
  constructor(){
    new A()
    new B()
    new C()
  }
}
