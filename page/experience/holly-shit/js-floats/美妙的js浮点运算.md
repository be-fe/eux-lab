@#:{c259dcd36bc265d44d726c596656d8cf}#@

## 事情的起因射这样的

某天, 我在一次bug中发现有个顽固的bug, 表格提交总会报错. 经过排查, 尼玛就是俩数值死活不相等. 这时, 记起小时候师父循循的教导:
"孩子, 计算机科学中float运算是个坑. 切记, 切记."

立马在 Chrome 中尝试错误的例子, 果不其然, 这种酸爽...

```
> 67.01 + 1
68.01

> 670.01 + 10
680.01

> 67000.01 + 1000
68000.01

> 67000000.01 + 1000000
68000000.00999999

```

What the f**k is `68000000.00999999` ???

再来一个

```
> 0.1 + 0.2
0.30000000000000004
```

## 为什么呢?

在网上搜了一下, 这确实是个浮点运算的普遍的坑, js也不例外, 其基础是 IEEE 754 规范, 具体可以参照这个文档
[What Every Computer Scientist Should Know About Floating-Point Arithmetic](http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html).

中文参考: [IEEE运算](http://docs.oracle.com/cd/E57201_01/html/E57330/z4000ac020515.html#scrolltoc)

更直白的解释是, 其实你在程序中看到的0.1, 并不是0.1. 在js里, 浮点数的表示分为数值编码和显示数值.
例如0.1, 在后台js编译之后, 浮点数会被转换至用基数2来表示的编码, 所以0.1并不能
用基数2的编码来完美指定. 所以其实它真正的数值是`0.1` &plusmn; `e`, `e` 表示一个极小的偏差. 

接下来, 在实际应用场景中, js会将编码以一定的映射转成实际数值. 看看一下的例子

```
> 0.30000000000000003
0.30000000000000004

> 0.30000000000000002
0.30000000000000004

> 0.30000000000000001
0.3

> 0.29999999999999999
0.3

> 0.29999999999999998
0.3

> 0.29999999999999997
0.3

> 0.29999999999999996
0.29999999999999993
```

上面的例子中, 我们可以了解到, js的浮点数是有精度限制的. 那么之前问题就很好解释了, 让我们简单看看
`0.1 + 0.2 = 0.30000000000000004` 这个例子.

其实在js里, 它的运算应该理解如下:

```
0.1 + 0.2 

=> 

f1 = toFloatNumber(0.1)
f2 = toFloatNumber(0.2)
sum = floatAdd(f1, f2)
result = toDisplay(sum)
```

在这里, sum是一个以2为基数的浮点数编码. 恰好, 这个数值在js并不能完美的反转为 `0.3`

## 解决方案

既然知道这个问题, 那么就很好考虑解决方法了. 这里我们讨论四个思路:

* 数值向上scale做运算
* 运算结果rounding
* 浮点的比较运算 + 展示时rounding
* 利用 `toString()` 的特性, 新增一个js中通用的 Decimal 运算.

### 数值向上scale做运算

首先我们来看下面的例子:

```
> 0.1 + 0.2
0.30000000000000004

> 1 + 2
3
```

为什么呢? 因为在 `1 + 2` 的运算中, 实际运算的数值跟显示的数值都是一致的, 进一步说, 整型的运算, 不会存在无法掌控的小误差现象.

如果是做很关键的涉及金额的计算, 那么可以就可以考虑把数值从分值开始计算, 例如 `2002` 代表 `20.02`. 
如果有更高精度的要求, 可以用`200200`来代表`20.0200`. 

#### 缺点

这中方法的缺点是需要维护一套完全不一样的数值, 同时显示时要使用一套转换流程.

### 运算结果rounding

如果说, 我们还是存储正常的数值, 那么应该怎么保证所有数值都是正确的呢?

再看看下面的例子

```
> 3 * 0.1
0.30000000000000004

> 3 / 10
0.3
```

同样的道理, `3 * 0.1`中, 其实是 `3 * (0.1 + e)`, 所以还是会造成误差. 但是 `3 / 10` 却没有这个问题.
由于`Math.round`不支持指定小数位数的rounding运算, 让我们创建一下的一个rounding函数: 

```
var round = function(num, precision) {
    // 如果没手动指定rounding的小数位数, 则默认为10位小数
    precision = precision || 10;
    
    var scale = Math.pow(10, precision);
    return Math.round( num * scale ) / scale;
}
```

有了这个函数, 在所有涉及计算的地方, 我们可以对结果都进行规整:

```
> round(0.1 + 0.2)
0.3
```

注意, precision不是必须的参数, 因为基本上js的数值精度一般出问题的是在15位小数的位置, 所以基本10位小数就能解决小误差的问题.

#### 缺点

同样的, 虽然数值的存储和展示都不用做二次修改, 但是每次做运算的时候仍然得做额外的操作.

### 浮点的比较运算 + 展示时rounding

综上两种方案, 还有另一种方法就是只关注浮点数的比较以及在输出时进行rounding.

比较方法如下:

```
var floatEqual = function(a, b) {
    return round(a) == round(b);
}

var floatSmallerThan = function(a, b) {
    return round(a) < round(b);
}
```

这个方案中, 我们可以不用去关心每一次中间值的转换, 而只需在关键的比较运算时使用以上的方法来进行, 同时, 在最终需要展现数值的时候,
用round方法对输出的数值进行统一整理.

#### 缺点

需要小心操作, 否则有可能出错.

### 利用 `toString()` 的特性, 新增一个js中通用的 Decimal 运算

我们知道, js中object跟primitive数值的转换的是通过 `toString()`. 那么通过指定一个特殊的`toString()`, 来新建一个专门处理
浮点运算的类型, 也是一个可行的思路.

```
var DecimalType = function(value) {
    this.value = value;
};

DecimalType.prototype = {
    toString: function() {
        return Math.round(this.value * 10000000000) / 10000000000;
    },
    add: function(operand) {
        this.value = this.value + operand;
        return this;
    },
    sub: function(operand) {
        this.value = this.value - operand;
        return this;
    },
    mul: function(operand) {
        this.value = this.value * operand;
        return this;
    },
    div: function(operand) {
        this.value = this.value / operand;
        return this;
    }
};

var decimal = {
    val: function(value) {
        return new DecimalType(value);
    },
    add: function() {
        var result = 0;
        for (var i = 0; i < arguments.length; i++) {
            result += arguments[i];
        }
        return new DecimalType(result);
    },
    mul: function() {
        var result = 1;
        for (var i = 0; i < arguments.length; i++) {
            result *= arguments[i];
        }
        return new DecimalType(result);
    },
    sub: function(a, b) {
        return new DecimalType(a - b);
    },
    div: function(a, b) {
        return new DecimalType(a / b);
    }
};

decimal.add( 0.1, 0.2 ) == 0.3; // true
console.log( +decimal.val(0.1).mul(0.1) ) // 0.01

```

这么做的好处是明确的要求对某些处理统一使用一套方法, 减少由于疏忽而出现的问题.

#### 缺点

同样的, 要更改的地方也是挺多. 