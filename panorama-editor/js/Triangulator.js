(function(){

    var m_points;

    window.Triangulator =
    {
        caculate: function(_m_points)
        {
            m_points = _m_points;

            var indices = [];

            var n= m_points.length;
            if (n < 3)
                return indices;

            var V = [], v;
            if (Area() > 0)
            {
                for (v = 0; v < n; v++)
                V[v] = v;
            }
            else {
                for (v = 0; v < n; v++)
                    V[v] = (n - 1) - v;
            }

            var nv = n;
            var count = 2 * nv;
            var m = 0;
            for (v = nv - 1; nv > 2; )
            {
                if ((count--) <= 0)
                    return indices;

                var u = v;
                if (nv <= u)
                    u = 0;
                v = u + 1;
                if (nv <= v)
                    v = 0;
                var w = v + 1;
                if (nv <= w)
                    w = 0;

                if (Snip(u, v, w, nv, V))
                {
                    var a;
                    var b;
                    var c;
                    var s;
                    var t;
                    a = V[u];
                    b = V[v];
                    c = V[w];
                    indices.push(a);
                    indices.push(b);
                    indices.push(c);
                    m++;
                    s = v;
                    for (t = v + 1; t < nv; t++)
                    {
                        V[s] = V[t];
                        s++;
                    }
                    nv--;
                    count = 2 * nv;
                }
            }

            //indices.Reverse();
            return indices;
        }
    };


    /**
     * @return {number}
     */
    function Area () {
        var n = m_points.length;
        var A = 0;
        var q = 0;
        for (var p = n - 1; q < n; p = q++) {
            var pval = m_points[p];
            var qval = m_points[q];
            A += pval.x * qval.y - qval.x * pval.y;
        }
        return (A * 0.5);
    }

    function Snip (u, v, w, n, V) {
        var p;
        var A = m_points[V[u]];
        var B = m_points[V[v]];
        var C = m_points[V[w]];
        if (Mathf.Epsilon > (((B.x - A.x) * (C.y - A.y)) - ((B.y - A.y) * (C.x - A.x))))
            return false;
        for (p = 0; p < n; p++) {
            if ((p == u) || (p == v) || (p == w))
                continue;
            var P:Vector2 = m_points[V[p]];
            if (InsideTriangle(A, B, C, P))
                return false;
        }
        return true;
    }

}());





