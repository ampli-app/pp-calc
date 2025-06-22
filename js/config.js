// Configuration and Constants
const CONFIG = {
    // Authentication credentials
    AUTH: {
        USERNAME: 'PlentiPartners',
        PASSWORD: 'admin123'
    },

    // Company logo (base64 encoded)
    COMPANY_LOGO_BASE64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYEAAABrCAYAAACR8T50AAAABmJLR0QA/wD/AP+gvaeTAAAYbElEQVR42u2dCZgVxbXHa9jEmbvMnTvDAJrnqARFROH2nVERIyZE5Sm4IHEjgjtoQkAx+tS4QsA1rnEPajQRDWriEiMYiZpIXJ4LcUUFcQN8IO4KDMk50zXDvEv13n17uf/zff/PT52urq7bfX7dp06dEsKj1VcP6ZvLFMblM9q1dZni/Lq0toS0mtRK+ncFar28/nfqMoV5uVTh6lymeHhDTXNvAYPBYEmwXE7L5lOFk8nRLaxQR+9Shb/nUtrE+vrd07iLYDBY7CyT2a0uly7OIIe2Bg7dk1bTV9N5DFPcVTAYLA5WlU8XJuTT2ko4cF/1YS6jHYHbCwazbfzi9FPSbNL1pHGk7hiWAK2ubpdMXUa7Gw47UN1bWzu4FncbDGZqLaSPSP8u0YukvhieAKw+3dKfHNTbcNJl0evZbMvWCbl1mkizPGoG6XTSiaQfkrb0qW+nmZzzDDz1kbU86WMFANr1NEcsMEw+Wm11cQg5phVwzmUOD6WKOybg9hlm8rB60VukK0lexmixSftL8eRH1ibbuD92xTD5ZA2ZQj9ySMvhlEPRiobM4O8CAqbaQPoTaVtAoGLsChv3xTgMkw+WzQ7KIQQUfmgo5mmkQUOgXV+SjgcEImkHyHCekXq6CONZ3Q97Yti9WxVPUsIJR0AZbQ4gYFszAIHI2RyL36zOYXtbkL4wae9VUjcMu0ejFNDxcMARUqpwKCBgW1MAgURDgG1/AxC8RxqAIfcnDISJ4Gjpg5iGhcKAwDrSEEAg0RBgayJdRHqE9KAMLSG92g+TK4HheCOmfEo7O4EQmEfaxkTbk75HOpz0a9JqmyBYCAgkHgKwQABA5QtQCiKy+rixcaeahEHgfoftpUiXCD0ryAoEIwABQADmdC5ALwYHhxtZFY+pcAi029E2QHAvIAAIwBwaqoFGW7m09jgg0GGzLdrmicPNAQFAAGbTeD8AONrIqzWdbskDAm020EZIaI8QIcDlLbjA2R2kl0krSd9IOC0R+rwFFz47xAdHOJp0g4FmGRwzmDSTtIC0gvQ1aa3s51OkS0lDHfajoDj/2xa/0a0G/R5jcp7rTK73FHhzt/MBtCEMnGwcJogLBwMCHfaiRfuTQoDAbqRHSa3CWUbTH0iay3Oeb9L2spK/7Ud6yEHf/kFqttmPMcK/LK+LTc6z3uS4v8Kbu50P4B3B4GTjoMsAgQ67zaL96WWEQFa+9XtxfK3y66AmIAiMJH0q3KXdTgYEkj8f8BgcbCz0ICDQYb+0aP+qMkFgexni8csB8hfOFj5DYJgM+Xjp12RAINkQWAIHGwu9Bgh02MwIQGBHGVP3e9Hbm6RePkGAFxq+K/xZiNcCCCQXAp/E3DmupRTKZ2lR1R1tWzamC6fRXr4ntP1T//fb6d+fob/7NubXuRwQ6LDbQw4H8YTuOyK41c88advVBwic6WOfnhHG9foBgZhDYF0MHeLnpNm5THFkQ8PAlJ3r7NtXq67LanvTcTeRPo3hNX8BCHTYIov2JwYMgbk2nNnrQq9nxKUscqTecqL1Z6Q3bBw/1SMEVForAcNzKleT7nH4NbOXQT94M6QTSvScjes7QaFdAIHyQyBWm66QTrHr+M2AQBPik6mt92N07d8CAm02yIazGhYgBPYW1nsdXCjMK1ryG/VZwjyT6BNhnUJqFwJ8nlkSRKXWhXSUsFea4zcOfqcg1gkAAhUMgXV1Ke1Kr86/1JrE8J4cMqL2vwYEYgMBq8ygoBeLPWcBACcbm0ywuJbTfYAA3zf72JzjsMogWgYIAAJhrJZdXFvTPDjIMeAtHXniFRCIPAQm2HB6cy3a8AKBoRbnvsbFNf3OpL3FPkDg5w76cqKN9nKAACBQzpo5f66r2yVTjnHgks20n8IDgEAkIdCDdIGwtxAryAJy11uEb6pdjNUAi+sZ5AECy4WzjVY2E/rKYbM2NUAAECjXzlp3U4WAHuUdjeHd2rKMAIGgIfCwfKM0UqN0frzIidNBPxDRKCVttibgWg/j9YxJuyd7gMCVLvpyj3A3OQwIAAJ+AqA4v/wAaLexXSO6xWaSIBCEOPNl5wAh0GRx/lEexusWk3Zne4DABBd9mW7R5n8DAoBA0FrkrX7+2K68S5rQsx5cWVs6aVp7CRCIFQQm2eybWwiMtHH+ES5lVnZigQcI7OPit5tm0eZ+gAAgEOCeutqXdanmgY5i+VQFNZfSTqrLFObJFNL1HRlFlAKqx/mLx6TTWr2Tdqlg2wDOzQcEIg8BzshxsvuaWwj8LASwWU0OW0FgqIvfbiogAAiEmAlUOM1uv7m0Mjn4WQ5WAn/Laaa8i5rdc+irjwGBCEOAUxqPcNg3txA4LyQIfAQIAAKVAoFXKfGgu623/3RxtIdVv8sp7XSYvdHRukcodRQQ2Ch2BncJZ8XWvELgspAgsAYQAAQqAgJUAuJwm/09hTdZ8VSbP619k88Uf2zrayCjHQEIRAICHPZ5Xuipok0e+uYWApeHBIHPAAFAoBIg8DZP6FrG6TPFo3w853qaR7AxcTa8G/3tO4CArxB4ReirYa30E9J4odeTqfWpb24hcAEgAAgAAsFNCP/CGgDNzQGUd1idzWrbWo6RXloCEPAPAveH2De3EDjV4pq2D+FaAAFAIBkQyGabt7HoZhX93T8DKktxn/UcREt/QKDiIXCg8GcRFSAACAACJXrdso+p4phg+9A81MY4LQEEKhoC2wv/F2YBAoAAIEC60UYfA90Ck0tF2OjDbECgoiHAiw/N6urcCQgAAoCAm3AMLfQy619t7eBaffewQPuxmieALcbpFECgoiEgpKM3OvYrUoPLPhWEXpitdwVBoBcgAAjob+E1zSPCDQXZCwlRquh+gEDFQ2CUxXXd4qI/XOJkTac2viG9JfRyEbyN5uiEQmAgIAAIyMwg8zIR9DfTyrNOQTNdeVqfHVIEBCoeApzGbLW38CQHfeEQ070W7R0UUwjcatHOFEAAEGhTbe2QrSz6d1mZ+jLNFALp4naAQMVDgG2CsF7Udokw392s7ZYi/dGirQ+FXuM/jhCYJaxLfuytgCwgUGkQ6FWzS6N5/wq3RGGtQkOm0A8QAASEvj/w34X1Iq8VEgYHyJj/d0g7yH/nHcg+t9HG5BjPCYwV9hbDMeh4y87XSKssQAAIAAKB7mJ2rFk/aquLQwABQEAaf72uFMGuFH5aWO8KFmUIpIW+37PT6x4ECAACoUCAaheZbpaRrxnyA0AAECi5xk8DAsC7pC1t9CHKEGCb7uLajwMEAIEwILDear8BSmWdBAgAAiXGaZ0f+QwArqvUZPP8UYdAT9KzDq//JkAAEAgDAk9YjRNB4CpAABBQGL88zBH+lMfmfYpTDs4ddQi0PcKkpxyMw8uAACBQdgjwW77lOGW0FwABQMDEWoSe7vmtQ+fPi8xuFe7y5uMAASHnNnhntg9twjAFCAAC5YTAO1ab2qdSQxq87mFQYRDgt+OxJto9xL6NNOnXfj60zyWveW+MK0jzSW9I57da/pPDPQ8LPXOIi9J52E+7DRxm45x30WZ/izb7eOgvr4soks4izSZx8cZ5Qt8giPdrmCjMq7EeYtKvPeHNAQGXqaGFQ22Egk5CFVEYDAYIJAwC+Yz2a5tj9DQgAIPBAIEkQSClPWpnT2PabH4PbC8Jg8EAgWRB4Ea7m9ozLAABGAwGCCQBAhltWS5TGGd3bPLp4gERAQAgAIPBAAGXam2L6WcKU7YUu21ud1zkPgZLAQEYDAYIRBcC79Pk7nX5tDarsyjj51yuBcSlIOqrNVcpbfTVcHeEAAAIwGAwQKA0rt8khvcMYkzyqeJZEQMAIACDwQCBjhW+ae1xoS88CWI8jiNtAARgMBggEFkIFPYPaCxOjSgAAAEYDAYIbNyNbHCTn2PQt69WTe3OjqjzjysEuCTwCS7FZQAY9LsJvQAZDAYDBDaqPqsV/Lp+Ci0NozZfiTgA4giBtcK/8srvk26WYOiCpxYGq/hwUHGG1+uuT7f0p3UAv41w+AcQUIu3IRyDJxcGq2AIkL6ivP9dnV+t1p02jB9N6aNzeSOZmDh/QECtuULfwhBmbt8jjSjR5hgWWNwhwLV/viSdk08VBmSzg3Klqq0dslWuRhuUTxcOopDPGXTMg6TPY+b4AQFz/S+pAU+xqS1XjNs2GBZY/CFQeUoCBLiG/lgbmiD0TUh4p60XSBtMQPAkaTM8yYAADBAABKIPgYNctrUd6XYTGJyPJxkQgAECgEByIdBuvBPXV4p2vyZ9B08zIAADBACBZENAyHCR6mvgl3iaAQEYIAAIJB8CbPcL9VqCKjzRgAAMEAAEkg+BkQZfA4PxRAMCMEAAEEg+BHhXuFWK9o/z0CZnGO1Jmka6gzSf9DzpJaFnIPF/O0voeffdPfZ/d7FpqYytFH83lHQFaSFpGWk1aQXpEYN2D1O0+6linM4UxiU7Mib93lLx93so/o6/yLjkxwWk+0jPkBaRniM9RJpF+gGpW8D3YBPpRNJN8vd8Tv6e8+TvOZm0ow9fkD0U43Kw4u9ypIlCX+PyBmml/E3fFfpqeCfWVd6v55DmyHuEr43TphfI/3a6/B2qAAFAIGkQEPKhLm3/UhftsBO42gAqRlojHZnbNQpXKdoc1en/70B63OT8/zJo9y3hfe1FP5N+7634++tL/maEdEZ2zrVUOkW/S4HsLR3hBpv9YId8rHTmbqxWqNewtFsX+XKxxqQPh9k8F0P6F6QPHPymb5KONoQBIAAIxBQCtyvan+3g+GrSxaR1HhzmZ0Jf0+AnBA4gfWFx3ihCgB3MdAeOt7PYYftRKLBRfmm4vfYlpBafIVAtv9yszm0HAqMMwnt2NU9+jQACgEAiIHCFov05No/dVr79+bVy+VSfIMDhn29tnC+KEJjp8bwvklIe7odm0oc+XD+P/ySfIMBgvN/mea0gMMUlYEu1aBPgAgKAQEwh8FuXXwJbCD2TyOxBWS7f3n4v2+QHebHJ37dKB+kFAgdagGmtDQhwCOntEq1XtLVM8Xft2soFBEYqHNR6eZ6nSH8R+spvK8Dd5vJeKJI+MWmX+/KaDCE+IuPnVl9bU32AwJEW51hrEwKHmgCgVZ6L79NL5L11lwy1GZ13vpxTAAQAgcTNCVxicUwXOcmrejA2yMlCzeR4Xrl8p8Hx7ziIKasgUDoHsErOVQwj9ZZvld1kyMNJFpSf2UEqCDwoHWz7v/Pb+NkStqXGb/pHybEy+g2GOuxTL5MvgMUy1p9VHMdjuS/pMRPn+n0PEPhAxuJLS5xwf/qLjUX8UvK+MvKDDQbzVQy2a0j/ZXBclUxieNHg+iYBAoBAnCHQXWZVOM0OOt7ggfhavonbtTMN2jnSAwQ663fSsfhhQUOgs/5ks988ufmoQRv3OOzTwwYwudgBlI81+EphWPV0CYHO4iyg0S7H/DyD+3Ufm8f3MJgn+bgDRIAAIBBDCOxr8LDtbHJMlUFI53PSXi76oHJi9/sAgRk+/w7lgsA84Szls6bkC6JzTN7u3MB+BgCY5OLa9jcInU31CIHlFiE2K1ukaPM0h23UGMwXTQAEAIG4QuA+RdvvCet8bw4d/FTGhNuPO8lHh7jKIwQeEv6nS5YDArwWoa+L9vYxaG+kzeNVqaiXexir6UKdxtrVJQRaZTjPrW0m2yhtN+eirQPFxgl4Tm8eLtrXuwACgEDMIHCwwQM302E73yX9xIPT7WkQQmjwAIEgVjyXAwIXu2yvShE3Z/3cxrHDhDrFs6eHsao2GK+9XELgAY+/XaOiza9cttXFENSAACAQIwjwG6Iqq+MbkwmyIG2poi8DXUJgYUB9LAcEvMDrRkV7N9g47mbFcSf6MF4zFO3+yiUE9vfYlxqDdvv4eocAAoBADCDQRzrO1jLF0e2a6i22xSUEbo4pBNZ6DGFNUbR5l43jlolNJ0tTPozXri4AbQSBrXzoz0ofv7wAAUAgdAicKzbd71YlfuMfJ/TMiPnCPL+c69KEsWcuh5NUE4lDXULgnJhCYJnH/h0l1FlGZtZPqCem/bBagxBMlcNj+N7wozbS74V68num/FLwBQLrwnRu2Wyz6Q1Zl9HuBgDa9EUCIOC3XhfqfPQgrKsMOe0rH8CVBn1yC4EzYgqBf3rs36FCvfbAzEYL52tEnJgq5NjoEAJ+vbQNM7n/edHj/wh93YEnCKwO07nl09p4494N70Z/8z4A0KaPAIFNFlfV+9znLvINf4z8auH6RH8T+oSj3eupNAg8GQIEphnA6Aaf9Llwln4cJATY7rBx370i7yu+d3s5hcCSkJ3bm/X1u6fVXwHFqXD+HXoNEOjIu/aS1VPq9Lkc70XSiXzpQ/8AgeAhcFEZvjKd/K5BQ4DnOhY46OsGCYVrhb6WwjxcWpcpzIuAg1uYTxUGbOzVwB65tHZG2KGqKIm+mB6oYAh8KePExwhvKYDt1kOCxGvBtQ2AQCgQuDYECHw/RAiw8ZoBzlJyU/X2Mzlm6uKAuUzxmog4ug2kl0lPkD6B499ElyYAAhxeOd2GThZ6/fNRMjzj5+YjXKfleQ/OgJfbM5APJ70MCIQCgRtDgMCIkCHQ8YZMukVOVrupkMp7cXcvgUDhSDjYGHwJpAoHJwACB4XcpybpxO08LIvk1wc77Cnys3rbkvZeAgRCgYCqjDin684LUIWIQKDduP7SIRIITr9oOeNuY2ZRfbXWB0428mrNZHarAwQ8Gb/9vGDyYDwr9JosOwv720cCAuFA4ELFMWeFeG+FAYFS6yOhcKXQt9FcbwGCe0onh5+Go42uaH7kryJ+FjUIjDd4GN4T9ksGAwLRgMBximOuq3AIlBqntJ5k8eKz78aQUEo7Cc42yiocDQh4tgeEutZMbw9t/gsQCAUCeyiO+RsgoDTOgDtXGBcslBDIaVlMxkZWHzc27lQDCHg21cbc4z22+SkgEAoE0or7i8tGbA4IGNptij7yoriNSRe0MvdCONwopoYWzhTxtKhBQNWfAR7a20JgnUBYEBBCvUPcYYCAoWnCqhhdbe3gWnI6y+F4I6X3GhoGpgABz1ZlMFGW9dDmmTGGwMAEQOBUoV41XOWxP1sLPf23PkIQyAu9hPpEj22o7tf/v3Ygnyn+GI43QkppY0V8LWpfAv+n6M92LtviuvPLYgIB1f67wxMAgbwMATndYtTKbhUbN4RhqFxAGhICBHhRJGf6cPLBhk4hr5zL9goG9+um7dEk5B/ggCOgTPEuEW+LGgSeEO42L1HZTSI+ZSNUWzienQAIsF0t1KvLm1325YcGX4znh/QloMr/n+WyrRsUbb2tvhoKC1FK4mI44lD1aozDQFGFgCpD4hNhtJRebTzxaLVaNWoQUG3FyV8xDQmAAH8NrFIcv0Z0Tn+0Z3sYtMUrc/uGBIFLhLpE9SiH7Rwj1CVOjPclyGa1bblqJZxxKPqAQNwk4m9Rg8DWBn1aIR2RVSx5uFCvC4g6BCYZ9PNVGWduh0FKjlGcICDkNagcHP83LlOyg8XxnE/PBemMavKcG+KcQB+hLmrIfT1HhiWtru16g/HhSqlbml9VTfNgckgr4JTLC4BcqrijSIZFsWzEr0yc91LSNdJpjpWaKB3264q/ny3isVgsK0Fnp5zA0hhCgG26xXW9LMMhHP47gXSKdPy8tuAbk+MWCHurx4OcGD7dpH/8xcNlpnmS/DB5z3La83mkPwvzIo72tuJsyBT6UfXKt+Ccy1MqOiFfAFGGAE+2PSO8FxN7TU6oxQECbPsJ+1Vdt4ghBOyAwKkeE/YnYYOEAH+h3unztc101IO6ul0ytIZgDpx0kCrO5bkYkSyLIgSEfLCf8vAA8SrhdljHBQJs44S9MsRjYwoBth/JeR6v5cE5K8dJ5dqgU0S7SMe9QXgvyX6iaxpR+uhRWEcQSPjnMJFMiyoEhHzAzxbqHaSMtE7GVztvgBQnCLBxcbyFFtd5eYwhwNZbOvGvXThJLi1ScHHOci0W21Wos9zs3Ls8P7KN5x60LSjLaBegxIRnraI1AOcY7aiWEDtNbLpPQP+I9ZGzS7hM9OMmToPjybMM+n6M4hrt7Hk8QnHcrmW87hahZ4ZwieRXZXiL4+O/EeZZNVsr+n2kx75sr2jzEB+usVbGx+cIvcx0q+KNn/eJfpg0VfbDrW2muIZpAf5+PNl9vgxZrTL4muEMMM4M482TGn3vAYeIqOjcJApj/AMO3dGmOU/SOozjE+7842pdpZPTpJPkkE8NhiUxxhO89fJtuJfwZ3vSqBhndvWV18b/7FnWszfUNPem3ckOz6UKV9Pb7aNyIpk3r19foc6er3t121qLlPYX0pV1qcKhjamdeuE5hMFgUbP/AOfQG3Sn7h+7AAAAAElFTkSuQmCC',

    // Interest rate calculation multipliers
    MULTIPLIERS: {
        // Frequency multipliers
        FREQUENCY: {
            monthly: 0.9210,
            quarterly: 0.9445,
            semiannual: 0.9810,
            annual: 1.0425
        },

        // Period multipliers (months)
        MONTHS: {
            12: 0.9700,
            18: 0.9800,
            24: 0.9900,
            30: 1.0500,
            36: 1.0850,
            48: 1.1520
        },

        // Capital multipliers (ranges)
        CAPITAL: [
            { min: 10000, max: 29999, multiplier: 1.0000 },
            { min: 30000, max: 49999, multiplier: 1.0655 },
            { min: 50000, max: 99999, multiplier: 1.0655 },
            { min: 100000, max: 199999, multiplier: 1.0990 },
            { min: 200000, max: 999999, multiplier: 1.1880 },
            { min: 1000000, max: 9999999, multiplier: 1.1880 }
        ],

        // Final payment multiplier
        FINAL_PAYMENT: 1
    },

    // Final payment percentages based on months and tax form
    FINAL_PAYMENT_PERCENT: {
        12: { liniowy: 75.0, ryczalt: 100.0 },
        18: { liniowy: 62.5, ryczalt: 90.0 },
        24: { liniowy: 50.0, ryczalt: 80.0 },
        30: { liniowy: 37.5, ryczalt: 70.0 },
        36: { liniowy: 25.0, ryczalt: 60.0 },
        48: { liniowy: 0.0, ryczalt: 40.0 }
    },

    // Settlement frequency mapping
    SETTLEMENT: {
        monthly: { freq: 1, text: 'Miesięczne' },
        quarterly: { freq: 3, text: 'Kwartalne' },
        semiannual: { freq: 6, text: 'Półroczne' },
        annual: { freq: 12, text: 'Roczne' }
    },

    // Tax rate options for different tax forms
    TAX_RATES: {
        ryczalt: [
            { value: '8.5', text: '8,5%' },
            { value: '12.5', text: '12,5%' }
        ],
        liniowy: [
            { value: '9', text: '9%' },
            { value: '19', text: '19%' }
        ]
    },

    // Bonus calculation
    BONUS: {
        RATE: 0.005, // 0.5% of capital
        DEADLINE_DAY: 15, // Must transfer before 15th day of month
        MONTHS_DELAY: 3 // Bonus paid 3 months after start date
    },

    // VAT rate for brutto calculations
    VAT_RATE: 1.23,

    // IRR calculation settings
    IRR: {
        MAX_ITERATIONS: 1000,
        TOLERANCE: 0.0000001,
        DEFAULT_GUESS: 0.1
    },

    // Default values
    DEFAULTS: {
        BASE_INTEREST_RATE: 12.5,
        CAPITAL: 100000,
        MONTHS: 36,
        SETTLEMENT: 'annual',
        TAX_FORM: 'ryczalt'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}